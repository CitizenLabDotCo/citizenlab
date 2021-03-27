module ApartmentActiveJob
  module MonkeyPatches
    #
    # Patching:
    #   https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/base.rb
    #
    module ActiveJob::Base
      def self.prepended(base)
        base.class_eval do
          class << self
            # https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/execution.rb
            def execute(job_data)
              Apartment::Tenant.switch(job_data.with_indifferent_access['tenant_schema_name']) { super }
            end
          end
        end
      end

      # https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/core.rb
      def serialize
        super.merge('tenant_schema_name' => Apartment::Tenant.current)
      end
    end
  end
end
