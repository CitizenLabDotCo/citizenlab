pipeline {
  agent any
  tools {
    nodejs 'Node 7.x'
  }
  stages {
    stage('Install dependencies') {
      steps {
        echo 'Installing'
        sh 'yarn install'
      }
    }
    stage('Test') {
      steps {
        echo 'Testing'
        sh 'yarn run test'
      }
    }
    stage('Build') {
      steps {
        echo 'Building'
        sh 'yarn run build'
      }
    }
    stage("Deploy to staging") {
      when {
        // Only deploy master branch
        expression { env.BRANCH_NAME == 'master' }
      }
      steps {
        step([$class: 'S3BucketPublisher',
          consoleLogLevel: 'INFO',
          pluginFailureResultConstraint: 'FAILURE',
          entries: [[
            sourceFile: 'build/*',
            bucket: 'cl2-front-staging',
            selectedRegion: 'eu-central-1',
            noUploadOnFailure: true,
            managedArtifacts: false,
            flatten: true,
            showDirectlyInBrowser: true,
            keepForever: true
          ]],
          profileName: 'jenkins',
          dontWaitForConcurrentBuildCompletion: false,
        ])
      }
    }
  }
  post {
    always {
      junit 'junit.xml'
      cleanWs()
    }
    success {
      slackSend color: '#50c122', message: ":tada: SUCCESS: ${env.JOB_NAME} build #${env.BUILD_NUMBER} passed all tests!\nMore info at ${env.BUILD_URL}"
    }
    failure {
      slackSend color: '#e93b1c', message: ":boom: FAILURE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} failed\nSee what went wrong at ${env.BUILD_URL}"
    }
    unstable {
      slackSend color: '#d59a35', message: ":thinking_face: succeeded, but flagged UNSTABLE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} passed all tests!\nThis probably means there were some warnings or pending tests.\nMore info at ${env.BUILD_URL}"
    }
  }
}
