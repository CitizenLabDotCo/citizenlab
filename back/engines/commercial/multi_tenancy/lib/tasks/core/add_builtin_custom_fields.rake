# frozen_string_literal: true

namespace :cl2back do
  desc 'Add the built in demographic fields to existing tenants. Should run only once'
  task add_builtin_custom_fields: :environment do
    tenant_deserializer = ::MultiTenancy::Templates::TenantDeserializer.new
    base_template = YAML.load_file(Rails.root.join('config', 'tenant_templates', 'base.yml'))
    template = base_template
    template['models'] = template['models'].slice('custom_field', 'custom_field_option')

    Tenant.all.each do |tenant|
      tenant.switch do
        puts "Adding custom fields for tenant #{tenant.name}"
        tenant_deserializer.resolve_and_apply_template(template)
      end
    end
  end
end
