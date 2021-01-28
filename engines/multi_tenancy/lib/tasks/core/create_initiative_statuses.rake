
namespace :cl2back do
  desc "Adds the initiative statuses to all platforms"
  task :create_initiative_statuses => :environment do
    template = YAML.load open(Rails.root.join('config', 'tenant_templates', 'base.yml')).read
    template = {'models' => {'initiative_status' => template.dig('models', 'initiative_status')}}

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        TenantTemplateService.new.apply_template template
      end
    end
  end
end
