pipeline {
    agent any
   
    environment{
        SCANNER_HOME= tool 'Jenkins-sonar'
    }

    stages {
        stage('git-checkout') {
            steps {
                git branch: 'main', changelog: false, poll: false, url: 'https://github.com/kotttyaravind/to-do-app.git'
            }
        }

        stage('Sonar Analysis') {
            steps {
                sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.host.url=http://146.148.111.92:9000/ -Dsonar.login=squ_fb6b012e84e402cbd908d7f7f75531161a4da423 -Dsonar.projectName=to-do-app -Dsonar.projectKey=to-do-app -Dsonar.sources=. '''
            }
        }
           
}
        stage('Docker Build') {
            steps {
                script{
                    withDockerRegistry(credentialsId: 'a54ef4f7-243c-48d4-9c68-6fd84c15775c') {
                        sh docker build -t todoapp:latest -f docker/Dockerfile .
                        sh docker tag todoapp:latest kotttyaravind/todoapp:latest
                    }
                }
            }
        }

        stage('Docker Push') {
            steps {
                script{
                    withDockerRegistry(credentialsId: 'a54ef4f7-243c-48d4-9c68-6fd84c15775c') {
                        sh docker push kotttyaravind/todoapp:latest
                    }
                }
            }
        }

        stage('Trivy') {
            steps {
                sh trivy image kotttyaravind/todoapp:latest
            }
        }

        stage('Deploy to Docker') {
            steps {
                script{
                    withDockerRegistry(credentialsId: '9ea0c4b0-721f-4219-be62-48a976dbeec0') {
                        sh docker run -d --name to-do-app -p 4000:4000 kotttyaravind/todoapp:latest
                    }
                }
            }
        }
    }
}
