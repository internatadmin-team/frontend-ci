// Pipeline CI du frontend : build, tests, analyses de securite, image Docker et publication sur Docker Hub.
//
// Prerequis de l'instance Jenkins :
//   - agent portant le label MI_AG, lance directement sur le Mac (agent.jar) avec Docker Desktop ;
//   - plugins : workflow-aggregator, credentials-binding, junit, github ;
//   - credential dockerhub-credentials : utilisateur et jeton d'acces Docker Hub.
//
// Node et Trivy tournent dans des conteneurs ephemeres : l'espace de travail y est monte au meme chemin que
// sur l'hote, et le dossier persistant ~/.cache/internatadmin-ci de l'hote sert de HOME (TOOL_HOME) : le cache
// npm et la base Trivy sont conserves entre les builds. Les tests utilisent Vitest et jsdom : pas de navigateur.

// Lance une commande dans un conteneur outil, avec l'utilisateur de l'agent.
// extraArgs : options docker run supplementaires.
// returnStatus : renvoie le code de sortie au lieu de faire echouer le stage.
def runTool(String image, String extraArgs, String command, boolean returnStatus = false) {
    sh returnStatus: returnStatus, script: """
        mkdir -p "\$HOME/.cache/internatadmin-ci"
        docker run --rm -v "\$WORKSPACE:\$WORKSPACE" -w "\$WORKSPACE" \\
            -v "\$HOME/.cache/internatadmin-ci:\$TOOL_HOME" -e HOME="\$TOOL_HOME" \\
            -u "\$(id -u):\$(id -g)" ${extraArgs} ${image} ${command}
    """
}

// Trivy lit l'image locale par la socket Docker.
// Sous Docker Desktop, la socket vue du conteneur appartient a root:root (0660) : d'ou --group-add 0.
def trivy(String command, boolean returnStatus = false) {
    runTool(env.TRIVY_IMAGE, '--group-add 0 -v /var/run/docker.sock:/var/run/docker.sock', command, returnStatus)
}

pipeline {
    agent { label 'MI_AG' }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
        timeout(time: 60, unit: 'MINUTES')
    }

    triggers {
        // webhook GitHub si Jenkins est joignable, sinon scrutation du depot
        githubPush()
        pollSCM('H/5 * * * *')
    }

    parameters {
        booleanParam(name: 'TRIGGER_DEPLOY', defaultValue: false, description: 'Declencher le job de deploiement apres le push')
        string(name: 'DEPLOY_JOB', defaultValue: 'deployment-cd', description: 'Job Jenkins du depot deployment-cd')
    }

    environment {
        NODE_IMAGE = 'node:24-alpine'
        TRIVY_IMAGE = 'aquasec/trivy:0.58.2'
        TRIVY_VULN_EXIT_CODE = '10'
        // HOME des conteneurs outils, adosse a ~/.cache/internatadmin-ci sur l'hote
        TOOL_HOME = '/ci-home'
        DOCKERHUB_USER = 'abdoulaye940'
        DOCKERHUB_REPO = 'daara-frontend'
        IMAGE_REPO = "${DOCKERHUB_USER}/${DOCKERHUB_REPO}"
        // tag de version lisible : 1.<numero de build>
        VERSION = "1.${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                // reports/ n'est pas suivi par Git : sans ce nettoyage, les rapports des builds precedents seraient archives
                sh 'rm -rf reports'
                script {
                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse --short=12 HEAD').trim()
                    def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: '').replaceFirst('^origin/', '')
                    env.IS_MAIN = (branch == 'main').toString()
                    echo "Commit ${env.GIT_SHA}, branche ${branch}"
                }
            }
        }

        stage('Installation des dependances') {
            steps {
                runTool(env.NODE_IMAGE, '', 'npm ci --no-fund --no-audit')
            }
        }

        stage('Build Angular') {
            steps {
                runTool(env.NODE_IMAGE, '', 'npx ng build --configuration production')
            }
        }

        stage('Tests unitaires') {
            steps {
                runTool(env.NODE_IMAGE, '',
                        'npx ng test --watch=false --reporters=default --reporters=junit --output-file=reports/junit/frontend.xml')
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit/*.xml'
                }
            }
        }

        stage('Analyse des dependances (npm audit)') {
            steps {
                // rapport complet archive, puis controle bloquant a partir de la severite haute
                sh 'mkdir -p reports/npm-audit'
                runTool(env.NODE_IMAGE, '', "sh -c 'npm audit --json > reports/npm-audit/audit.json || true'")
                runTool(env.NODE_IMAGE, '', 'npm audit --audit-level=high')
            }
        }

        stage("Build de l'image") {
            steps {
                sh "docker build --label org.opencontainers.image.revision=${env.GIT_COMMIT} -t ${IMAGE_REPO}:${env.GIT_SHA} ."
            }
        }

        stage("Scan de l'image (Trivy)") {
            steps {
                script {
                    sh 'mkdir -p reports/trivy'
                    def image = "${IMAGE_REPO}:${env.GIT_SHA}"
                    // rapport HIGH et CRITICAL archive, puis controle bloquant sur CRITICAL seulement
                    trivy("image --scanners vuln --timeout 20m --cache-dir \"\$TOOL_HOME/.cache/trivy\" --no-progress " +
                          "--severity HIGH,CRITICAL --format table --output reports/trivy/image.txt ${image}")
                    // code dedie : 10 = vulnerabilites trouvees, tout autre code non nul = echec de l'outil
                    def status = trivy("image --scanners vuln --timeout 20m --cache-dir \"\$TOOL_HOME/.cache/trivy\" --skip-db-update --no-progress " +
                                       "--severity CRITICAL --exit-code ${TRIVY_VULN_EXIT_CODE} --format json " +
                                       "--output reports/trivy/image-critical.json ${image}", true)
                    if (status.toString() == TRIVY_VULN_EXIT_CODE) {
                        error('Vulnerabilites CRITICAL dans l\'image (voir reports/trivy)')
                    } else if (status != 0) {
                        error("Echec de l'analyse Trivy (code ${status}) : resultat inconnu, pas une vulnerabilite")
                    }
                }
            }
        }

        stage('Push Docker Hub') {
            when { expression { env.IS_MAIN == 'true' } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials',
                                                  usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        set +x
                        printf '%s' "$DOCKER_PASS" | docker login --username "$DOCKER_USER" --password-stdin
                    '''
                }
                sh """
                    docker tag ${IMAGE_REPO}:${env.GIT_SHA} ${IMAGE_REPO}:${VERSION}
                    docker tag ${IMAGE_REPO}:${env.GIT_SHA} ${IMAGE_REPO}:latest
                    docker push ${IMAGE_REPO}:${env.GIT_SHA}
                    docker push ${IMAGE_REPO}:${VERSION}
                    docker push ${IMAGE_REPO}:latest
                """
            }
        }

        stage('Declenchement du deploiement') {
            when { expression { params.TRIGGER_DEPLOY && env.IS_MAIN == 'true' } }
            steps {
                build job: params.DEPLOY_JOB, wait: false, parameters: [
                    string(name: 'FRONTEND_TAG', value: env.GIT_SHA)
                ]
            }
        }
    }

    post {
        always {
            archiveArtifacts allowEmptyArchive: true, fingerprint: false, artifacts: 'reports/**'
            sh 'docker logout >/dev/null 2>&1 || true'
            script {
                // images locales du build : elles sont sur Docker Hub, on libere le disque du poste
                if (env.GIT_SHA) {
                    sh "docker image rm ${IMAGE_REPO}:${env.GIT_SHA} ${IMAGE_REPO}:${VERSION} ${IMAGE_REPO}:latest >/dev/null 2>&1 || true"
                }
            }
        }
        success {
            echo "Build reussi : commit ${env.GIT_SHA}, version ${VERSION}"
        }
        failure {
            echo 'Build en echec : voir le stage en rouge et les rapports archives'
        }
    }
}
