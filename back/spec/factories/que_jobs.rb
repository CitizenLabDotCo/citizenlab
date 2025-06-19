# frozen_string_literal: true

FactoryBot.define do
  factory :que_job do
    transient do
      enqueued_at { Time.zone.now }
    end

    priority { 100 }
    run_at { enqueued_at }
    job_class { 'ActiveJob::QueueAdapters::QueAdapter::JobWrapper' }
    error_count { 0 }
    queue { 'default' }
    data { {} }
    job_schema_version { 2 }
    kwargs { {} }

    args do
      [{
        job_id: SecureRandom.uuid,
        locale: 'en',
        priority: nil,
        timezone: 'UTC',
        arguments: [],
        job_class: 'TestJob',
        executions: 0,
        queue_name: 'default',
        enqueued_at: enqueued_at.iso8601,
        provider_job_id: nil,
        tenant_schema_name: nil,
        exception_executions: {}
      }]
    end
  end
end
