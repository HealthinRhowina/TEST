pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
    }

    environment {
        DOCKER_IMAGE = 'healthin0601/employee-enrollment'
        DOCKER_PATH = 'C:\\Users\\hrhow\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'
        PATH = "${DOCKER_PATH};${env.PATH}"
    }

    stages {

        stage('Build') {
            steps {
                bat 'mvn clean package -DskipTests'
            }
        }

        stage('Unit Tests') {
            steps {
                bat 'mvn test'
            }
        }

        stage('Install Node Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Start Spring Boot') {
            steps {
                bat '''
                start /B java -jar target\\employee-enrollment-0.0.1-SNAPSHOT.jar > springboot.log 2>&1
                '''
            }
        }

        stage('Wait for Application') {
            steps {
                bat '''
                powershell -Command "$max=30; for($i=0;$i -lt $max;$i++){ try { $r=Invoke-WebRequest -Uri 'http://localhost:8082/api/employees' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200){ Write-Host 'Application is ready'; exit 0 } } catch {} ; Start-Sleep -Seconds 2 }; Write-Host 'Application did not start'; Get-Content springboot.log; exit 1"
                '''
            }
        }

        stage('Playwright API Tests') {
            steps {
                bat 'npx playwright test'
            }
        }

        stage('Check Docker') {
            steps {
                bat 'docker --version'
                bat 'docker info'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t %DOCKER_IMAGE%:latest .'
                bat 'docker images %DOCKER_IMAGE%'
            }
        }

        stage('Generate Docker HTML Report') {
            steps {
                bat '''
                powershell -NoProfile -Command "$image = docker image inspect '%DOCKER_IMAGE%:latest' | ConvertFrom-Json; $repo='%DOCKER_IMAGE%'; $tag='latest'; $id=$image.Id.Substring(7,12); $created=$image.Created; $size=[math]::Round($image.Size/1MB,2); $html='<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Docker Report</title><style>body{font-family:Arial;background:#f4f6f8;padding:40px}.container{max-width:850px;margin:auto;background:white;padding:30px;border-radius:12px}h1{text-align:center;color:#2496ed}.success{color:green;font-size:20px;font-weight:bold;text-align:center}table{width:100%%;border-collapse:collapse;margin-top:25px}th{background:#2496ed;color:white}th,td{padding:14px;border:1px solid #ddd}</style></head><body><div class=\"container\"><h1>Docker Image Report</h1><div class=\"success\">Docker Image Created Successfully</div><table><tr><th>Property</th><th>Value</th></tr><tr><td>Repository</td><td>'+$repo+'</td></tr><tr><td>Tag</td><td>'+$tag+'</td></tr><tr><td>Image ID</td><td>'+$id+'</td></tr><tr><td>Created</td><td>'+$created+'</td></tr><tr><td>Image Size</td><td>'+$size+' MB</td></tr><tr><td>Jenkins Build</td><td>#%BUILD_NUMBER%</td></tr><tr><td>Docker Build</td><td>PASS</td></tr></table></div></body></html>'; Set-Content docker-report.html $html -Encoding UTF8"
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    bat '''
                    echo %DOCKER_TOKEN% | docker login -u %DOCKER_USER% --password-stdin
                    docker push %DOCKER_IMAGE%:latest
                    docker logout
                    '''
                }
            }
        }

        // =====================================================
        // KUBERNETES DEPLOYMENT
        // =====================================================
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'kubernetes-server-ssh',
                        usernameVariable: 'K8S_USER',
                        passwordVariable: 'K8S_PASSWORD'
                    )
                ]) {
                    script {

                        def remote = [:]

                        remote.name = 'kubernetes-server'
                        remote.host = '122.165.70.116'
                        remote.port = 22

                        remote.user = K8S_USER
                        remote.password = K8S_PASSWORD
                        remote.allowAnyHosts = true

                        sshCommand remote: remote, command: '''
                            echo "========== KUBERNETES DEPLOYMENT =========="

                            export KUBECONFIG=/home/mani/.kube/config

                            cd /home/mani/employee-k8s

                            echo "Current Pods:"
                            kubectl get pods

                            echo "Restarting deployment with latest Docker image..."

                            kubectl rollout restart deployment/employee-enrollment

                            echo "Waiting for rollout..."

                            kubectl rollout status deployment/employee-enrollment --timeout=120s

                            echo "========== DEPLOYMENTS =========="
                            kubectl get deployments

                            echo "========== PODS =========="
                            kubectl get pods

                            echo "========== SERVICES =========="
                            kubectl get svc

                            echo "========== APPLICATION TEST =========="
                            curl -f http://localhost:30082/api/employees

                            echo ""
                            echo "Kubernetes deployment completed successfully."
                        '''
                    }
                }
            }
        }

        stage('Generate Pipeline HTML Report') {
            steps {
                bat '''
                powershell -NoProfile -Command "$html='<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Jenkins CI/CD Report</title><style>body{font-family:Arial;background:#eef2f7;padding:40px}.container{max-width:900px;margin:auto;background:white;padding:35px;border-radius:15px}h1{color:#2563eb;text-align:center}.success{color:green;text-align:center;font-size:22px;font-weight:bold}table{width:100%%;border-collapse:collapse;margin-top:30px}th{background:#2563eb;color:white}th,td{padding:15px;border:1px solid #ddd}.pass{color:green;font-weight:bold}</style></head><body><div class=\"container\"><h1>Jenkins CI/CD Pipeline Report</h1><div class=\"success\">PIPELINE SUCCESS</div><table><tr><th>Stage</th><th>Status</th></tr><tr><td>Maven Build</td><td class=\"pass\">PASS</td></tr><tr><td>JUnit Tests</td><td class=\"pass\">PASS</td></tr><tr><td>Playwright API Tests</td><td class=\"pass\">PASS</td></tr><tr><td>Docker Build</td><td class=\"pass\">PASS</td></tr><tr><td>Docker Push</td><td class=\"pass\">PASS</td></tr><tr><td>Kubernetes Deployment</td><td class=\"pass\">PASS</td></tr><tr><td>Docker Image</td><td>%DOCKER_IMAGE%:latest</td></tr><tr><td>Jenkins Build Number</td><td>#%BUILD_NUMBER%</td></tr></table></div></body></html>'; Set-Content pipeline-report.html $html -Encoding UTF8"
                '''
            }
        }
    }

    post {
        always {

            junit allowEmptyResults: true,
                  testResults: 'target/surefire-reports/*.xml'

            archiveArtifacts artifacts: 'playwright-report/**',
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'docker-report.html',
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'pipeline-report.html',
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'springboot.log',
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'reports/api-performance.html',
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'reports/api-performance.json',
                             allowEmptyArchive: true
        }

        success {
            echo '''
            ========================================
            PIPELINE COMPLETED SUCCESSFULLY

            Maven Build          : PASS
            Unit Tests           : PASS
            Playwright Tests     : PASS
            Docker Build         : PASS
            Docker Push          : PASS
            Kubernetes Deploy    : PASS
            ========================================
            '''
        }

        failure {
            echo '''
            ========================================
            PIPELINE FAILED

            Check:
            - Maven
            - JUnit
            - Playwright
            - Docker
            - Kubernetes
            - Application logs
            ========================================
            '''
        }
    }
}