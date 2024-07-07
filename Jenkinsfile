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
        JMETER_TEST_PLAN = 'jmeter/simple_test.jmx'
        JMETER_RESULTS_DIR = "jmeter/results-${BUILD_NUMBER}.jtl"
        APP_URL = 'http://localhost'  // Update with your application's URL if different
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
                    // Ensure PATH includes JMeter bin directory
                    env.PATH = "${JMETER_HOME}/bin:${env.PATH}"
                    
                    // Run JMeter test on the deployed application
                    sh '''
                        jmeter -n -t ${JMETER_TEST_PLAN} -l ${JMETER_RESULTS_DIR} -Jtarget.url=${APP_URL}
                        echo 'JMeter performance test completed'
                    '''
                }
            }
            post {
                always {
                    // Archive JMeter results
                    archiveArtifacts artifacts: "${JMETER_RESULTS_DIR}", allowEmptyArchive: true
                }
            }
        }

        stage('Post-Test Cleanup') {
            steps {
                script {
                    dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD') {
                        sh 'docker-compose down'
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Ensure cleanup is done even if the pipeline fails
                dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD') {
                    sh 'docker-compose down'
                }
            }
        }
    }
}
