module ApartmentQue
  module MonkeyPatches
    # patching https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/queue_adapters/que_adapter.rb
    module ActiveJob::QueueAdapters::QueAdapter
      module JobWrapper
        def run(job_data)
          Apartment::Tenant.switch(job_data[:tenant_schema_name]) do
            super
          end
        end
      end
    end
  end
end
