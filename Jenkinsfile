pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        SONARQUBE_URL = 'http://192.168.156.25:9000'
        SONARQUBE_TOKEN = credentials('sonarqube-token')
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        TRIVY_VERSION = '0.53.0'
        DOCKER_REPO = 'syahridan/devops-avengers-cicd-app'
        JMETER_HOME = '/var/lib/jenkins/workspace/DevOps-Avengers_CICD (rnd)/jmeter'
        PATH = "${JMETER_HOME}/bin:${env.PATH}"
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
                    dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD (rnd)') {
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
                    // Check if jmeter directory exists, if not create it
                    if (!fileExists("${JMETER_HOME}")) {
                        sh "mkdir -p '${JMETER_HOME}'"
                    }

                    // Copy the test plan from the existing location to the JMeter home directory
                    sh '''
                        cp /home/syahridan/jmeter/simple_test.jmx ${JMETER_HOME}/simple_test.jmx
                    '''

                    env.PATH = "${JMETER_HOME}/bin:${env.PATH}"
                    sh 'ls -l ${JMETER_HOME}'
                    sh "jmeter -n -t ${JMETER_HOME}/simple_test.jmx -l ${JMETER_HOME}/results-${BUILD_NUMBER}.jtl -e -o ${JMETER_HOME}/report-${BUILD_NUMBER}"
                    echo 'JMeter performance test completed'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${JMETER_HOME}/results-${BUILD_NUMBER}.jtl", allowEmptyArchive: true
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${JMETER_HOME}/report-${BUILD_NUMBER}",
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
                dir('/var/lib/jenkins/workspace/DevOps-Avengers_CICD (rnd)') {
                    // sh 'docker-compose down'
                }
            }
        }
    }
}
