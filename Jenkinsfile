pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        SONARQUBE_URL = 'http://192.168.156.25:9000'
        SONARQUBE_TOKEN = credentials('sonarqube-token')
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        TRIVY_VERSION = '0.53.0'
        DOCKER_IMAGE_NAME = 'devops-avengers_cicd-app'  // Correct Docker image name
        DOCKER_REPO = 'syahridan/devops-avengers-cicd-app'  // DockerHub repository
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
                            // Verify sonar-scanner installation
                            sh '''
                                if ! command -v sonar-scanner &> /dev/null
                                then
                                    echo "sonar-scanner not found!"
                                    exit 1
                                fi
                            '''
                            sh '''
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
                    sh '''
                        docker-compose build
                        docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Trivy Image Scanning') {
            steps {
                script {
                    sh '''
                        if ! command -v trivy &> /dev/null
                        then
                            wget https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-x86_64.tar.gz
                            tar zxvf trivy_${TRIVY_VERSION}_Linux-x86_64.tar.gz
                            mv trivy /usr/local/bin/
                        fi

                        # Scan the Docker image
                        trivy image --no-progress --exit-code 1 --severity HIGH,CRITICAL ${DOCKER_IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Docker Hub Image Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            # Log in to Docker Hub
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

                            # Tag the Docker image with the build number
                            docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REPO}:latest
                            docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REPO}:build-${env.BUILD_NUMBER}

                            # Push the Docker image to Docker Hub
                            docker push ${DOCKER_REPO}:latest
                            docker push ${DOCKER_REPO}:build-${env.BUILD_NUMBER}
                        '''
                    }
                }
            }
        }

        stage('JMeter Performance Testing') {
            steps {
                script {
                    sh '''
                        jmeter -n -t /home/syahridan/jmeter/simple_test.jmx -l /home/syahridan/jmeter/results-${env.BUILD_NUMBER}.jtl
                        echo 'JMeter performance test completed'
                    '''
                }
            }
            post {
                always {
                    jmeterResults "/home/syahridan/jmeter/results-${env.BUILD_NUMBER}.jtl"
                    archiveArtifacts artifacts: "jmeter/results-${env.BUILD_NUMBER}.jtl", allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker-compose down'
            }
        }
    }
}
