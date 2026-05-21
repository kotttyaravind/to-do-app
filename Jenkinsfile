pipeline {
    agent any
    environment {
        SCANNER_HOME = tool 'Jenkins-sonar'
    }
    stages {
        stage('git-checkout') {
            steps {
                git branch: 'main', changelog: false, poll: false, url: 'https://github.com/kotttyaravind/to-do-app.git'
            }
        }
        stage('Sonar Analysis') {
            steps {
                sh '$SCANNER_HOME/bin/sonar-scanner -Dsonar.host.url=http://34.59.190.19:9000/ -Dsonar.login=squ_fb6b012e84e402cbd908d7f7f75531161a4da423 -Dsonar.projectName=to-do-app -Dsonar.projectKey=to-do-app -Dsonar.sources=.'
            }
        }
        stage('Docker Build') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'a54ef4f7-243c-48d4-9c68-6fd84c15775c') {
                        sh "docker build -t todoapp:latest -f backend/Dockerfile ."
                        sh "docker tag todoapp:latest aravindkotty/todoapp:latest"
                    }
                }
            }
        }
        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'a54ef4f7-243c-48d4-9c68-6fd84c15775c') {
                        sh "docker push aravindkotty/todoapp:latest"
                    }
                }
            }
        }
        stage('Trivy') {
            steps {
                sh "trivy image aravindkotty/todoapp:latest"
            }
        }
        stage('Deploy to Docker') {
steps {
script {
sh 'docker rm -f to-do-app || true'

        sh 'docker run -d --name to-do-app -p 4000:4000 kotttyaravind/todoapp:latest'
    }
}

}
    }
}
