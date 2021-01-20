module ApartmentQue
  module MonkeyPatches
    # patching https://github.com/rails/rails/blob/1eeb26c8527beffc8207af819b5432aa91341595/activejob/lib/active_job/base.rb
    module ActiveJob::Base
      def self.prepended(base)
        base.class_eval do
          attr_accessor :tenant_schema_name
        end
      end

      def serialize
        super.merge('tenant_schema_name' => Apartment::Tenant.current)
      end

      def deserialize(job_data)
        super
        self.tenant_schema_name = job_data.with_indifferent_access['tenant_schema_name']
      end

      def deserialize_arguments(serialized_args)
        Apartment::Tenant.switch(tenant_schema_name) { super }
      end
    end
  end
end
