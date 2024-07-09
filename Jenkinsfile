pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        SONARQUBE_URL = 'http://192.168.156.25:9000'
        SONARQUBE_TOKEN = credentials('sonarqube-token')
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        TRIVY_VERSION = '0.53.0'
        DOCKER_REPO = 'syahridan/devops-avengers-cicd-app'
        JMETER_HOME = '/opt/apache-jmeter-5.6.3'  // Update JMETER_HOME to the correct JMeter installation directory
        PATH = "${JMETER_HOME}/bin:${env.PATH}"  // Add JMeter bin directory to PATH
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'rnd', url: 'https://github.com/muxika21/DevOps_Avenger_CICD.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=syahridan-cicd-project \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=node_modules/** \
                        -Dsonar.host.url=$SONARQUBE_URL \
                        -Dsonar.login=$SONARQUBE_TOKEN
                    '''
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                script {
                    sh 'docker-compose build'
                }
            }
        }

        stage('Trivy Image Scanning') {
            steps {
                script {
                    sh '''
                        trivy image --no-progress --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_REPO}:latest
                    '''
                }
            }
        }

        stage('Docker Hub Image Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker tag ${DOCKER_REPO}:latest ${DOCKER_REPO}:build-${BUILD_NUMBER}
                            docker push ${DOCKER_REPO}:build-${BUILD_NUMBER}
                        '''
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD_RND') {
                        sh 'docker-compose up -d'
                        sh 'docker-compose ps'
                        sh 'docker-compose logs'
                    }
                }
            }
        }

        stage('JMeter Performance Testing') {
            steps {
                script {
                    // Set up JMeter environment
                    env.PATH = "${JMETER_HOME}/bin:${env.PATH}"

                    // Ensure the jmeter directory exists and is writable
                    sh 'mkdir -p ${WORKSPACE}/jmeter'

                    // List the contents of the JMeter bin directory to verify 'jmeter' is available
                    sh 'ls -l ${JMETER_HOME}/bin'

                    // Run JMeter performance tests
                    sh "jmeter -n -t ${WORKSPACE}/jmeter/simple_test.jmx -l ${WORKSPACE}/jmeter/results-${BUILD_NUMBER}.jtl -e -o ${WORKSPACE}/jmeter/report-${BUILD_NUMBER}"
                    echo 'JMeter performance test completed'
                }
            }
            post {
                always {
                    // Archive the JMeter results file
                    archiveArtifacts artifacts: "jmeter/results-${BUILD_NUMBER}.jtl", allowEmptyArchive: true
                    
                    // Publish the JMeter HTML report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "jmeter/report-${BUILD_NUMBER}",
                        reportFiles: 'index.html',
                        reportName: "JMeter Report - Build ${BUILD_NUMBER}"
                    ])
                }
            }
        }
    }

    post {
        always {
            script {
                // Optional cleanup step; comment out if you want to keep containers for inspection
                dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD_RND') {
                    // sh 'docker-compose down'
                }
            }
        }
    }
}
