# frozen_string_literal: true

FactoryBot.define do
  factory :jobs_tracker, class: 'Jobs::Tracker' do
    association :root_job, factory: :que_job
    root_job_type { TestJob.name }
  end
end
