module ApartmentQue
  module MonkeyPatches
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
