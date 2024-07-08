pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        SONARQUBE_URL = 'http://192.168.156.25:9000'
        SONARQUBE_TOKEN = credentials('sonarqube-token')
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        TRIVY_VERSION = '0.53.0'
        DOCKER_REPO = 'syahridan/devops-avengers-cicd-app'
        JMETER_HOME = '/opt/apache-jmeter-5.6.3'
        PATH = "${JMETER_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', url: 'https://github.com/muxika21/DevOps_Avenger_CICD.git'
            }
        }

        stage('Install Dependencies and Unit Test') {
            steps {
                script {
                    dir('backend') {
                        sh 'npm install'
                        sh 'npm test'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    dir('backend') {
                        withSonarQubeEnv('SonarQube') {
                            sh '''
                                if ! command -v sonar-scanner &> /dev/null
                                then
                                    echo "sonar-scanner not found!"
                                    exit 1
                                fi
                                sonar-scanner \
                                -Dsonar.projectKey=DevOps_Avenger_CICD \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=node_modules/** \
                                -Dsonar.host.url=${SONARQUBE_URL} \
                                -Dsonar.login=${SONARQUBE_TOKEN}
                            '''
                        }
                    }
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
                        trivy image --no-progress --exit-code 1 --severity HIGH,CRITICAL ${DOCKER_REPO}:latest
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
                    dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD') {
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
                    env.PATH = "${JMETER_HOME}/bin:${env.PATH}"
                    sh 'ls -l ${WORKSPACE}/jmeter'
                    sh "jmeter -n -t ${WORKSPACE}/jmeter/simple_test.jmx -l ${WORKSPACE}/jmeter/results-${BUILD_NUMBER}.jtl -e -o ${WORKSPACE}/jmeter/report-${BUILD_NUMBER}"
                    echo 'JMeter performance test completed'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "jmeter/results-${BUILD_NUMBER}.jtl", allowEmptyArchive: true
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
                dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD') {
                    // sh 'docker-compose down'
                }
            }
        }
    }
}
