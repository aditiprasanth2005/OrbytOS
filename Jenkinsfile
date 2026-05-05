pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "aditiprasanth/orbytos-backend"
        EC2_HOST = "100.30.204.247"   // ✅ FIXED IP
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:latest .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $DOCKER_IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST << 'EOF'

                    docker stop backend || true
                    docker rm backend || true

                    docker stop orbytos || true
                    docker rm orbytos || true

                    docker pull aditiprasanth/orbytos-backend:latest

                    docker run -d -p 8080:3000 --name backend aditiprasanth/orbytos-backend:latest

                    EOF
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sh 'curl http://100.30.204.247:8080/health'
            }
        }
    }
}