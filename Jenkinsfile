pipeline {
    agent any

    triggers {
        githubPush()
    }

    tools {
        maven 'Maven-3.9.16'
    }

    environment {
        DOCKER_IMAGE = 'employee-enrollment'
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
                powershell -Command "$max=30; for($i=0;$i -lt $max;$i++){ try { $r=Invoke-WebRequest -Uri 'http://localhost:8082/api/employees' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200){ Write-Host 'Application is ready'; exit 0 } } catch {} ; Start-Sleep -Seconds 2 }; Write-Host 'Application did not start'; exit 1"
                '''
            }
        }

        stage('Playwright API Tests') {
            steps {
                bat 'npx playwright test'
            }
        }

        stage('Docker Build') {
            steps {
                bat '''
                docker build -t employee-enrollment:latest .
                docker images employee-enrollment
                '''
            }
        }

        stage('Save Docker Image') {
            steps {
                bat '''
                if exist employee-enrollment.tar del employee-enrollment.tar
                docker save -o employee-enrollment.tar employee-enrollment:latest
                '''
            }
        }

        stage('Transfer and Import Image') {
            steps {
                sshPublisher(
                    publishers: [
                        sshPublisherDesc(
                            configName: 'office-server',
                            transfers: [
                                sshTransfer(
                                    sourceFiles: 'employee-enrollment.tar',
                                    remoteDirectory: '.',
                                    execCommand: '''
                                        echo "Importing Docker image into K3s..."

                                        sudo k3s ctr images import /home/mani/employee-enrollment.tar

                                        echo "Image imported successfully."

                                        sudo k3s ctr images list | grep employee-enrollment
                                    '''
                                )
                            ],
                            verbose: true
                        )
                    ]
                )
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sshPublisher(
                    publishers: [
                        sshPublisherDesc(
                            configName: 'office-server',
                            transfers: [
                                sshTransfer(
                                    execCommand: '''
                                        export KUBECONFIG=/home/mani/.kube/config

                                        echo "Restarting Employee Deployment..."

                                        kubectl rollout restart deployment/employee-enrollment

                                        kubectl rollout status deployment/employee-enrollment --timeout=120s

                                        echo "========== PODS =========="
                                        kubectl get pods

                                        echo "========== SERVICES =========="
                                        kubectl get svc

                                        echo "========== APPLICATION TEST =========="
                                        curl -f http://localhost:30082/api/employees
                                    '''
                                )
                            ],
                            verbose: true
                        )
                    ]
                )
            }
        }
    }

    post {

        always {
            junit allowEmptyResults: true,
                  testResults: 'target/surefire-reports/*.xml'

            archiveArtifacts artifacts: 'playwright-report/**',
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'springboot.log',
                             allowEmptyArchive: true
        }

        success {
            echo '''
            ==================================
            DEPLOYMENT SUCCESS

            Maven Build       : PASS
            Unit Tests        : PASS
            Playwright        : PASS
            Docker Build      : PASS
            Image Transfer    : PASS
            K3s Import        : PASS
            Kubernetes Deploy : PASS
            ==================================
            '''
        }

        failure {
            echo 'Build or deployment failed. Check Console Output.'
        }
    }
}