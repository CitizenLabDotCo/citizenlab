module ApartmentActiveJob
  module MonkeyPatches
    #
    # Patching:
    #   https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/base.rb
    #
    # Through methods from these modules:
    #   https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/core.rb
    #   https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/execution.rb
    #
    module ActiveJob::Base
      def self.prepended(base)
        base.class_eval do
          class << self
            def execute(job_data)
              Apartment::Tenant.switch(job_data.with_indifferent_access['tenant_schema_name']) { super }
            end
          end
        end
      end

      def serialize
        super.merge('tenant_schema_name' => Apartment::Tenant.current)
      end
    end
  end
end
