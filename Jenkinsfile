// ============================================================
//  ENTREGABLE #4 - Integracion Continua
//  Materia : Gestion de Calidad de Sistemas (SIS-312)
//  Sistema : XCollegeNexus
//  Entorno : Jenkins ejecutandose en un contenedor Docker (Linux)
//
//  Este pipeline:
//   1. Obtiene el codigo del Frontend y del Backend desde GitHub
//   2. Instala dependencias y corre control de calidad (lint)
//   3. Construye el "ejecutable" (build de produccion del Frontend)
//   4. Instala la aplicacion en un ambiente destino: /deploy/XCollegeNexus
//      (volumen montado -> en el host Windows:
//       C:\Users\ASUS\Desktop\UNIVERSIDAD\Deploy\XCollegeNexus)
// ============================================================

pipeline {
    agent any

    environment {
        // Node.js esta instalado dentro del contenedor en /var/jenkins_home/nodejs
        // (se agrega al PATH para que 'node', 'npm' y 'npx' esten disponibles).
        PATH           = "/var/jenkins_home/nodejs/bin:${PATH}"
        BACKEND_REPO   = 'https://github.com/LEONGO037/BackEnd-Proyecto-Arqui.git'
        BACKEND_BRANCH = 'main'
        // Ambiente destino dentro del contenedor (montado como volumen al host)
        DEPLOY_DIR     = '/deploy/XCollegeNexus'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('1. Checkout Frontend (SCM)') {
            steps {
                echo 'Codigo del Frontend obtenido desde GitHub via SCM.'
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('2. Checkout Backend') {
            steps {
                echo 'Clonando el repositorio del Backend...'
                dir('backend-src') {
                    // Repositorio publico: no requiere credenciales
                    git branch: "${BACKEND_BRANCH}",
                        url: "${BACKEND_REPO}"
                }
            }
        }

        stage('3. Instalar dependencias') {
            steps {
                echo 'Instalando dependencias del Frontend...'
                // Si 'npm ci' falla por package-lock desactualizado, usar 'npm install'
                sh 'npm ci'
            }
        }

        stage('4. Control de Calidad (Lint)') {
            steps {
                echo 'Ejecutando analisis estatico de codigo (ESLint)...'
                // El lint no detiene el pipeline: si hay advertencias, el build
                // queda marcado como UNSTABLE pero la instalacion continua.
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    sh 'npm run lint'
                }
            }
        }

        stage('5. Build - Generar ejecutable') {
            steps {
                echo 'Generando el build de produccion del Frontend (carpeta dist/)...'
                sh 'npm run build'
            }
        }

        stage('6. Empaquetar artefacto') {
            steps {
                echo 'Empaquetando el ejecutable...'
                sh 'tar -czf XCollegeNexus-frontend.tar.gz -C dist .'
                archiveArtifacts artifacts: 'XCollegeNexus-frontend.tar.gz', fingerprint: true
            }
        }

        stage('7. Instalar en Ambiente Destino') {
            steps {
                echo "Instalando la aplicacion en ${DEPLOY_DIR} ..."

                // Preparar una carpeta destino limpia
                sh '''
                    rm -rf "$DEPLOY_DIR"
                    mkdir -p "$DEPLOY_DIR/frontend"
                    mkdir -p "$DEPLOY_DIR/backend"
                '''

                // Instalar Frontend: copiar el build de produccion al destino
                sh 'cp -r dist/. "$DEPLOY_DIR/frontend/"'

                // Instalar Backend: copiar el codigo fuente al destino
                sh 'cp -r backend-src/. "$DEPLOY_DIR/backend/"'
                sh 'rm -rf "$DEPLOY_DIR/backend/.git"'

                // Instalar las dependencias de produccion del Backend en el destino
                dir("${DEPLOY_DIR}/backend") {
                    sh 'npm install --omit=dev'
                }

                // Inyectar la configuracion del Backend (.env) de forma segura,
                // tomandola de una credencial "Secret file" de Jenkins.
                withCredentials([file(credentialsId: 'backend-env', variable: 'ENV_FILE')]) {
                    sh 'cp "$ENV_FILE" "$DEPLOY_DIR/backend/.env"'
                }
            }
        }

        stage('8. Verificar instalacion') {
            steps {
                echo '--- Contenido instalado en el ambiente destino ---'
                sh 'ls -la "$DEPLOY_DIR"'
                sh 'ls -la "$DEPLOY_DIR/frontend"'
                sh 'ls -la "$DEPLOY_DIR/backend"'
            }
        }
    }

    post {
        success {
            echo '======================================================='
            echo '  BUILD E INSTALACION COMPLETADOS CORRECTAMENTE'
            echo '  Ambiente destino (host): C:\\Users\\ASUS\\Desktop\\UNIVERSIDAD\\Deploy\\XCollegeNexus'
            echo '======================================================='
        }
        unstable {
            echo 'Pipeline OK, pero el Lint reporto advertencias de calidad.'
        }
        failure {
            echo 'El pipeline FALLO. Revisar el log de la consola de Jenkins.'
        }
    }
}
