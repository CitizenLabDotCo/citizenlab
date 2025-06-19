# frozen_string_literal: true

FactoryBot.define do
  factory :jobs_tracker, class: 'Jobs::Tracker' do
    root_job factory: :que_job
    root_job_type { TestJob.name }

    trait :with_phase_context do
      context factory: :phase
      project { context.project }
    end

    trait :with_owner do
      owner factory: :admin
    end
  end
end
