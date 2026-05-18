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
               
			sh ''' $SCANNER_HOME/bin/Jenkins-sonar -Dsonar.url=http://35.255.164.147:9000/ -Dsonar.login=squ_b5d6f0da6934c5585333eedcbb58e26bbb7ec1d8 -Dsonar.projectName=to-do-app -Dsonar.projectKey=to-do-app -Dsonar.sources=. '''
                  }
            }
           
		stage('OWASP Dependency Check') {
            steps {
               dependencyCheck additionalArguments: '--scan ./', odcInstallation: 'DP'
                    dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
     

         stage('Docker Build') {
            steps {
               script{
                   withDockerRegistry(credentialsId: '9ea0c4b0-721f-4219-be62-48a976dbeec0') {
                    sh "docker build -t  todoapp:latest -f docker/Dockerfile . "
                    sh "docker tag todoapp:latest username/todoapp:latest "
                 }
               }
            }
        }

        stage('Docker Push') {
            steps {
               script{
                   withDockerRegistry(credentialsId: '9ea0c4b0-721f-4219-be62-48a976dbeec0') {
                    sh "docker push  username/todoapp:latest "
                 }
               }
            }
        }
        stage('trivy') {
            steps {
               sh " trivy username/todoapp:latest"
            }
        }
		stage('Deploy to Docker') {
            steps {
               script{
                   withDockerRegistry(credentialsId: '9ea0c4b0-721f-4219-be62-48a976dbeec0') {
                    sh "docker run -d --name to-do-app -p 4000:4000 username/todoapp:latest "
                 }
               }
            }
        }

    }
}
