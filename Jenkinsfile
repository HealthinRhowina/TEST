pipeline {
    agent any

    tools {
        maven 'Maven-3.9.16'
    }

    environment {
        DOCKER_IMAGE = 'healthin0601/employee-enrollment'
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
                bat 'npx playwright test src/test/tests/employee-api.spec.js'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t %DOCKER_IMAGE%:latest .'
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
    }

    post {
        always {
            junit allowEmptyResults: true,
                  testResults: 'target/surefire-reports/*.xml'

            bat '''
            powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*employee-enrollment-0.0.1-SNAPSHOT.jar*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
            '''
        }
    }
}