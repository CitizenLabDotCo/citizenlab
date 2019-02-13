
namespace :cl2back do

  desc "Add the built in demographic fields to existing tenants. Should run only once"
  task :add_builtin_custom_fields => :environment do
    tts = TenantTemplateService.new
    base_template = YAML.load_file(Rails.root.join('config', 'tenant_templates', "base.yml"))
    template = base_template
    template['models'] = template['models'].slice('custom_field', 'custom_field_option')
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Adding custom fields for tenant #{tenant.name}"
        tts.resolve_and_apply_template(template)
      end
    end
  end
end
