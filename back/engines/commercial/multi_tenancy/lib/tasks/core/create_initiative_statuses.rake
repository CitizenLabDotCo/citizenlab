# frozen_string_literal: true

namespace :cl2back do
  desc 'Adds the initiative statuses to all platforms'
  task create_initiative_statuses: :environment do
    template_path = Rails.root.join('config/tenant_templates/base.yml')
    template = YAML.load(File.read(template_path))
    template['models'].slice!('initiative_status')

    tenant_deserializer = MultiTenancy::Templates::TenantDeserializer.new

    Tenant.all.each do |tenant|
      tenant.switch do
        tenant_deserializer.deserialize(template)
      end
    end
  end
end
