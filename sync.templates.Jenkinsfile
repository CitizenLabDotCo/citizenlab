pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Building containers'
        sh 'docker-compose build'
        sh 'docker-compose up -d postgres redis'
        sleep 10
        echo 'Setting up database'
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm -e RAILS_ENV=test web bundle exec rake db:create'
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm -e RAILS_ENV=test web bundle exec rake db:migrate'
      }
    }

    stage('Push tenant templates to backup repository prrt') {
      steps {
        sh 'git clone git@github.com:CitizenLabDotCo/cl2-tenant-templates.git'
        withAWS(credentials: 'aws') {
          s3Download(file:'cl2-tenant-templates/', bucket:'cl2-tenant-templates', path:'test/', force:true)
        }
        sh 'cd cl2-tenant-templates'
        sh 'git checkout master'
        sh 'git add -A'
        sh 'git commit -am \'New tenant templates\''
        sh 'git push'
      }
    }

    stage('Generate tenant templates') {
      steps {
        echo 'Generating templates'
        sshagent (credentials: ['local-ssh-user']) {
          sh 'ssh -o StrictHostKeyChecking=no -l ubuntu 18.195.88.135 "docker run --env-file cl2-deployment/.env-production-benelux citizenlabdotco/cl2-back:production-benelux rake templates:generate"'
        }
      }
    }

    stage('Test tenant templates') {
      steps {
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm -e SPEC_OPTS="-t template_test" web bundle exec rake spec'
      }
    }

    stage('Push tenant templates to backup repository') {
      steps {
        sh 'git clone git@github.com:CitizenLabDotCo/cl2-tenant-templates.git'
        withAWS(credentials: 'aws') {
          s3Download(file:'cl2-tenant-templates/', bucket:'cl2-tenant-templates', path:'test/', force:true)
        }
        sh 'cd cl2-tenant-templates'
        sh 'git checkout master'
        sh 'git add -A'
        sh 'git commit -am \'New tenant templates\''
        sh 'git push'
      }
    }

    stage('Release tenant templates') {
      steps {
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm web bundle exec rake templates:release'
        slackSend color: '#50c122', message: ":tada: SUCCESS: ${env.JOB_NAME} build #${env.BUILD_NUMBER} generated new tenant templates!\nMore info at ${env.BUILD_URL}"
      }
    }
  }

  post {
    always {
      junit 'spec/reports/**/*.xml'
      sh 'docker-compose down --volumes'
      cleanWs()
    }
    failure {
      slackSend color: '#e93b1c', message: ":boom: FAILURE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} failed\nSee what went wrong at ${env.BUILD_URL}"
    }
    unstable {
      slackSend color: '#d59a35', message: ":thinking_face: succeeded, but flagged UNSTABLE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} passed all tests!\nThis probably means there were some warnings or pending tests.\nMore info at ${env.BUILD_URL}"
    }
  }
}
