pipeline {
    agent any

    environment {
        SCANNER_HOME    = tool 'Jenkins-sonar'
        DOCKER_IMAGE    = "aravindkotty/todoapp"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        GITOPS_REPO     = "github.com/kotttyaravind/todoapp-gitops.git"
        GITHUB_TOKEN    = credentials('github-token')   // Add this in Jenkins credentials
        ARGOCD_TOKEN    = credentials('argocd-token')   // added in Jenkins
    } 

    stages {

        stage('Git Checkout') {
            steps {
                git branch: 'main',
                    changelog: false,
                    poll: false,
                    url: 'https://github.com/kotttyaravind/to-do-app.git'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'a54ef4f7-243c-48d4-9c68-6fd84c15775c') {
                        // Tag with BOTH build number AND latest
                        sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} -f backend/Dockerfile ."
                        sh "docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'a54ef4f7-243c-48d4-9c68-6fd84c15775c') {
                        sh "docker push ${DOCKER_IMAGE}:${IMAGE_TAG}"   // versioned tag
                        sh "docker push ${DOCKER_IMAGE}:latest"         // latest tag
                    }
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh "trivy image ${DOCKER_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Docker') {
            // Keep this as fallback — ArgoCD will eventually replace this
            steps {
                script {
                    sh 'docker rm -f to-do-app || true'
                    sh "docker run -d --name to-do-app -p 4000:4000 \
                        -v todo-data:/app/data \
                        --restart always \
                        ${DOCKER_IMAGE}:${IMAGE_TAG}"
                }
            }
        }

        // ─── NEW STAGES BELOW ────────────────────────────────────────

        stage('Update GitOps Repo') {
            steps {
                sh """
                    # Remove old clone if exists
                    rm -rf gitops-repo

                    # Clone your gitops repo
                    git clone https://${GITHUB_TOKEN}@${GITOPS_REPO} gitops-repo

                    cd gitops-repo

                    # Update the image tag in kustomization.yaml
                    sed -i 's|newTag:.*|newTag: "${IMAGE_TAG}"|g' \
                        apps/todoapp/overlays/dev/kustomization.yaml

                    # Verify the change
                    grep "newTag" apps/todoapp/overlays/dev/kustomization.yaml

                    # Commit and push
                    git config user.email "jenkins@ci.local"
                    git config user.name "Jenkins CI"
                    git add apps/todoapp/overlays/dev/kustomization.yaml
                    git commit -m "ci: update image tag to ${IMAGE_TAG} [skip ci]"
                    git push origin main
                """
            }
        }

        stage('ArgoCD Sync') {
            steps {
                sh """
                    argocd app sync todoapp-dev \
                        --server localhost:8443 \
                        --auth-token ${ARGOCD_TOKEN} \
                        --insecure
                """
            }
        }

    }

    post {
        always {
            // Clean workspace and remove gitops clone
            sh 'rm -rf gitops-repo || true'
            sh 'docker logout || true'
        }
        success {
            echo "✅ Pipeline SUCCESS — Image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline FAILED at stage — check console logs"
        }
    }
}
