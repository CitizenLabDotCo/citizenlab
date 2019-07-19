pipeline {
  agent any

  triggers {
    cron('0 0 * * *')
  }

  /* 
    After https://reinout.vanrees.org/weblog/2017/10/03/docker-compose-in-jenkins.html.
    This solves the network (postgres and redis) not found issues during build stage.
  */
  environment {
    COMPOSE_PROJECT_NAME = "${env.JOB_NAME}-${env.BUILD_ID}"
  }

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

    stage('Generate tenant templates') {
      steps {
        echo 'Generating templates'
        sshagent (credentials: ['local-ssh-user']) {
          sh 'ssh -o StrictHostKeyChecking=no -l ubuntu 52.57.74.84 "docker run --env-file cl2-deployment/.env-production-benelux citizenlabdotco/cl2-back:production rake templates:generate[true]"'
        }
      }
    }

    stage('Test tenant templates') {
      steps {
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm -e SPEC_OPTS="-t template_test" web bundle exec rake spec'
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
      sh 'docker-compose down --volumes'
      cleanWs()
    }
    failure {
      slackSend color: '#e93b1c', message: "@dev-back :boom: FAILURE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} failed\nSee what went wrong at ${env.BUILD_URL}"
    }
    unstable {
      slackSend color: '#d59a35', message: ":thinking_face: succeeded, but flagged UNSTABLE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} passed all tests!\nThis probably means there were some warnings or pending tests.\nMore info at ${env.BUILD_URL}"
    }
  }
}
