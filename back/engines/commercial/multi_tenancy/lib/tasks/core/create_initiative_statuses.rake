# frozen_string_literal: true

namespace :cl2back do
  desc 'Adds the initiative statuses to all platforms'
  task create_initiative_statuses: :environment do
    template = YAML.load_file(Rails.root.join('config/tenant_templates/base.yml'))
    template = { 'models' => { 'initiative_status' => template.dig('models', 'initiative_status') } }

    Tenant.all.each do |tenant|
      tenant.switch do
        tenant_deserializer = ::MultiTenancy::Templates::TenantDeserializer.new
        tenant_deserializer.deserialize(template)
      end
    end
  end
end
