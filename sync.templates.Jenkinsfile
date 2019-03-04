pipeline {
  agent any
  stages {
    stage('Generate templates') {
      steps {
        echo 'Generating templates'
      }
    }

    stage('Test tenant templates') {
      steps {
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm -e SPEC_OPTS="-t template_test" web bundle exec rake spec'
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
