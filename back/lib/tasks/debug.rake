namespace :debug do
  desc 'Running a test job'
  task active_job: :environment do
    TestJob.set(wait: 10.seconds).perform_later
  end
end
