pipeline {
    agent any

    tools {
        maven 'Maven-3.9.16'
    }

    environment {
        // Docker Hub image
        DOCKER_IMAGE = 'healthin0601/employee-enrollment'

        // Docker Desktop path on Jenkins machine
        DOCKER_PATH = 'C:\\Users\\hrhow\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'

        // Add Docker to Jenkins PATH
        PATH = "${DOCKER_PATH};${env.PATH}"
    }

    stages {

        // =========================================================
        // 1. MAVEN BUILD
        // =========================================================
        stage('Build') {
            steps {
                echo '========== MAVEN BUILD =========='

                bat 'mvn clean package -DskipTests'
            }
        }


        // =========================================================
        // 2. JUNIT / MOCKITO TESTS
        // =========================================================
        stage('Unit Tests') {
            steps {
                echo '========== UNIT TESTS =========='

                bat 'mvn test'
            }
        }


        // =========================================================
        // 3. NODE DEPENDENCIES
        // =========================================================
        stage('Install Node Dependencies') {
            steps {
                echo '========== NPM INSTALL =========='

                bat 'npm install'
            }
        }


        // =========================================================
        // 4. START SPRING BOOT
        // =========================================================
        stage('Start Spring Boot') {
            steps {
                echo '========== START SPRING BOOT =========='

                bat '''
                start /B java -jar target\\employee-enrollment-0.0.1-SNAPSHOT.jar > springboot.log 2>&1
                '''
            }
        }


        // =========================================================
        // 5. WAIT UNTIL APPLICATION IS READY
        // =========================================================
        stage('Wait for Application') {
            steps {
                echo '========== WAITING FOR APPLICATION =========='

                bat '''
                powershell -NoProfile -Command "$max=30; for($i=0;$i -lt $max;$i++){ try { $r=Invoke-WebRequest -Uri 'http://localhost:8082/api/employees' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200){ Write-Host 'Application is ready'; exit 0 } } catch {} ; Start-Sleep -Seconds 2 }; Write-Host 'Application did not start'; Get-Content springboot.log; exit 1"
                '''
            }
        }


        // =========================================================
        // 6. PLAYWRIGHT API TESTS
        // =========================================================
        stage('Playwright API Tests') {
            steps {
                echo '========== PLAYWRIGHT API TESTS =========='

                bat 'npx playwright test'
            }
        }


        // =========================================================
        // 7. CHECK DOCKER
        // =========================================================
        stage('Check Docker') {
            steps {
                echo '========== CHECK DOCKER =========='

                bat 'docker --version'

                bat 'docker info'
            }
        }


        // =========================================================
        // 8. BUILD DOCKER IMAGE
        // =========================================================
        stage('Docker Build') {
            steps {
                echo '========== DOCKER BUILD =========='

                bat 'docker build -t %DOCKER_IMAGE%:latest .'
            }
        }


        // =========================================================
        // 9. SHOW DOCKER IMAGE
        // =========================================================
        stage('Show Docker Image') {
            steps {
                echo '========== DOCKER IMAGE =========='

                bat 'docker images %DOCKER_IMAGE%'
            }
        }


        // =========================================================
        // 10. GENERATE DOCKER HTML REPORT
        // =========================================================
        stage('Generate Docker HTML Report') {
            steps {
                echo '========== GENERATING DOCKER REPORT =========='

                bat '''
                powershell -NoProfile -Command ^
                "$repository = docker image inspect %DOCKER_IMAGE%:latest --format '{{index .RepoTags 0}}'; ^
                $imageId = docker image inspect %DOCKER_IMAGE%:latest --format '{{.Id}}'; ^
                $created = docker image inspect %DOCKER_IMAGE%:latest --format '{{.Created}}'; ^
                $sizeBytes = docker image inspect %DOCKER_IMAGE%:latest --format '{{.Size}}'; ^
                $sizeMB = [math]::Round(([double]$sizeBytes / 1MB),2); ^
                $html = '<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Docker Image Report</title><style>body{font-family:Arial;background:#f4f6f8;padding:40px}.container{max-width:900px;margin:auto;background:white;padding:35px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.15)}h1{text-align:center;color:#2496ed}.success{text-align:center;color:green;font-size:20px;font-weight:bold}table{width:100%%;border-collapse:collapse;margin-top:30px}th{background:#2496ed;color:white}th,td{padding:14px;border:1px solid #ddd;text-align:left}.footer{text-align:center;margin-top:30px;color:#666}</style></head><body><div class=\"container\"><h1>Docker Image Build Report</h1><p class=\"success\">Docker Image Created Successfully</p><table><tr><th>Property</th><th>Value</th></tr><tr><td>Repository / Tag</td><td>' + $repository + '</td></tr><tr><td>Image ID</td><td>' + $imageId + '</td></tr><tr><td>Image Size</td><td>' + $sizeMB + ' MB</td></tr><tr><td>Created</td><td>' + $created + '</td></tr><tr><td>Jenkins Job</td><td>%JOB_NAME%</td></tr><tr><td>Jenkins Build Number</td><td>%BUILD_NUMBER%</td></tr><tr><td>Maven Tests</td><td>PASS</td></tr><tr><td>Playwright API Tests</td><td>PASS</td></tr><tr><td>Docker Build</td><td>SUCCESS</td></tr></table><div class=\"footer\">Generated automatically by Jenkins CI/CD Pipeline</div></div></body></html>'; ^
                Set-Content -Path 'docker-report.html' -Value $html -Encoding UTF8"
                '''

                echo 'Docker HTML report generated.'
            }
        }


        // =========================================================
        // 11. DOCKER HUB PUSH
        // =========================================================
        stage('Docker Push') {
            steps {
                echo '========== DOCKER HUB PUSH =========='

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

    }


    // =============================================================
    // POST ACTIONS
    // =============================================================
    post {

        always {

            echo '========== PUBLISHING REPORTS =========='


            // JUnit report
            junit allowEmptyResults: true,
                  testResults: 'target/surefire-reports/*.xml'


            // Playwright HTML report
            archiveArtifacts artifacts: 'playwright-report/**',
                             allowEmptyArchive: true


            // Docker HTML report
            archiveArtifacts artifacts: 'docker-report.html',
                             allowEmptyArchive: true


            // Spring Boot application log
            archiveArtifacts artifacts: 'springboot.log',
                             allowEmptyArchive: true
        }


        success {

            echo '''
================================================
           PIPELINE SUCCESS
================================================

Maven Build          : PASS
JUnit Tests          : PASS
Playwright API Tests : PASS
Docker Build         : PASS
Docker Report        : CREATED
Docker Hub Push      : PASS

Docker Image:
healthin0601/employee-enrollment:latest

================================================
'''
        }


        failure {

            echo '''
================================================
           PIPELINE FAILED
================================================

Check:

1. Jenkins Console Output
2. JUnit Test Results
3. Playwright HTML Report
4. Spring Boot Log
5. Docker Build
6. Docker HTML Report

================================================
'''
        }
    }
}