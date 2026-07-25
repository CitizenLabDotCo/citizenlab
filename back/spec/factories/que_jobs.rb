# frozen_string_literal: true

FactoryBot.define do
  factory :que_job do
    transient do
      enqueued_at { Time.zone.now }
      tenant_schema_name { nil }
      # The ActiveJob class and its arguments, as opposed to the +job_class+ column, which
      # holds the ActiveJob wrapper for any job enqueued through ActiveJob.
      active_job_class { 'TestJob' }
      job_arguments { [] }
      related_gids { [] }
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
      active_job_data = {
        job_id: SecureRandom.uuid,
        locale: 'en',
        priority: nil,
        timezone: 'UTC',
        arguments: job_arguments,
        job_class: active_job_class,
        executions: 0,
        queue_name: 'default',
        enqueued_at: enqueued_at.iso8601,
        provider_job_id: nil,
        tenant_schema_name: tenant_schema_name,
        exception_executions: {}
      }
      active_job_data[:related_gids] = related_gids if related_gids.present?
      [active_job_data]
    end
  end
end
