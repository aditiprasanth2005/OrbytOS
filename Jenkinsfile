pipeline {
    agent any

    environment {
        IMAGE_NAME     = "orbytos-backend"
        CONTAINER_NAME = "orbytos"
        PORT           = "3000"
        EC2_HOST       = "52.90.204.179"
        EC2_USER       = "ubuntu"
        DOCKER_HUB_USER = ""   // populated in Build stage via script block
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out — commit: ${env.GIT_COMMIT?.take(8)}"
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        // Persist username so post{} block can reference it
                        env.DOCKER_HUB_USER = env.DOCKER_USER
                    }
                    sh "docker build -t \$DOCKER_USER/${IMAGE_NAME}:${BUILD_NUMBER} -t \$DOCKER_USER/${IMAGE_NAME}:latest ."
                    echo "✅ Docker image built: \$DOCKER_USER/${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    sh "docker push \$DOCKER_USER/${IMAGE_NAME}:${BUILD_NUMBER}"
                    sh "docker push \$DOCKER_USER/${IMAGE_NAME}:latest"
                    echo "✅ Pushed \$DOCKER_USER/${IMAGE_NAME}:latest and :${BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    ),
                    sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY ${EC2_USER}@${EC2_HOST} bash -s << 'REMOTE'
                            echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                            docker pull \$DOCKER_USER/${IMAGE_NAME}:latest
                            docker stop ${CONTAINER_NAME} || true
                            docker rm   ${CONTAINER_NAME} || true
                            docker run -d \\
                                --name ${CONTAINER_NAME} \\
                                -p ${PORT}:${PORT} \\
                                --restart unless-stopped \\
                                -e NODE_ENV=production \\
                                \$DOCKER_USER/${IMAGE_NAME}:latest
REMOTE
                    """
                    echo "✅ Deployed to EC2 at ${EC2_HOST}:${PORT}"
                }
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 15'
                sh "curl -f --retry 3 --retry-delay 5 http://${EC2_HOST}:${PORT}/health"
                echo "✅ Health check passed — backend is live at http://${EC2_HOST}:${PORT}"
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline complete — OrbytOS backend deployed successfully'
        }
        failure {
            echo '❌ Pipeline failed — check the stage logs above'
        }
        always {
            sh "docker rmi ${env.DOCKER_HUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} || true"
            sh "docker rmi ${env.DOCKER_HUB_USER}/${IMAGE_NAME}:latest || true"
            sh "docker logout || true"
        }
    }
}
