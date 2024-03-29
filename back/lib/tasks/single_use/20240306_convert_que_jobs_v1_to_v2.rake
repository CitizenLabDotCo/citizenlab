# frozen_string_literal: true

namespace :single_use do
  task convert_que_jobs_v1_to_v2: :environment do
    tenant_names = Apartment.tenant_names << 'public'

    tenant_names.each do |tenant_name|
      Apartment::Tenant.switch(tenant_name) do
        jobs_v1 = QueJob
          .by_args({ tenant_schema_name: tenant_name }, {})
          .not_expired.not_finished
          .where(job_schema_version: 1)

        Rails.logger.info('Converting Que jobs from v1 to v2', tenant_name: tenant_name, count: jobs_v1.count)

        jobs_v1.each do |job|
          begin
            job_class = job.args['job_class'].constantize
          rescue NameError
            next
          end

          begin
            arguments = ActiveJob::Arguments.deserialize(job.args['arguments'])
          rescue ActiveRecord::RecordNotFound, ActiveJob::DeserializationError
            next
          end

          QueJob.transaction do
            job_class.set(priority: job.priority, wait_until: job.run_at, queue: job.queue).perform_later(*arguments)
          end
        rescue StandardError => e
          Rails.logger.error('Failed to convert Que job from v1 to v2', job_id: job.id, exception: e)
        end
      end
    end
  end
end
