# frozen_string_literal: true

module MultiTenancy
  module Templates
    # `reuse_by` matchers for {TenantDeserializer} shared between template appliers.
    module ReuseMatchers
      # Points a template registration field at the tenant's own: built-ins by code, others by key.
      def self.registration_custom_field
        lambda do |attrs, klass|
          next if attrs['resource_type'] != 'User'

          fields = klass.registration
          attrs['code'].present? ? fields.find_by(code: attrs['code']) : fields.find_by(key: attrs['key'])
        end
      end
    end
  end
end
