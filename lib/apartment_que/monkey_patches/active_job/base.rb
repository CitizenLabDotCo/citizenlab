module ApartmentQue
  module MonkeyPatches
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
