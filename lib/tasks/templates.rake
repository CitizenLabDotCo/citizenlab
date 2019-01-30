require 'yaml'


namespace :templates do
  desc "Importing and exporting tenants as yaml files"

  task :export, [:host,:file] => [:environment] do |t, args|
    template = TenantTemplateService.new.tenant_to_template(Tenant.find_by(host: args[:host]))
    File.open(args[:file], 'w') { |f| f.write template }
  end

  task :import, [:host,:file] => [:environment] do |t, args|
    host = args[:host]
    Apartment::Tenant.switch(host.gsub('.', '_')) do
      TenantTemplateService.new.resolve_and_apply_template args[:file], is_path=true
    end
  end

  task :generate, [] => [:environment] do |t, args|
    template_hosts = Tenant.pluck(:host).select do |host| 
      host.ends_with? ENV.fetch('TEMPLATE_URL_SUFFIX','.localhost') # '.template.citizenlab.co'
    end

    template_hosts.each do |host|
      template = TenantTemplateService.new.tenant_to_template(Tenant.find_by(host: host))
      File.open("config/tenant_templates/#{host.split('.').first}_template.yml", 'w') { |f| f.write template }
    end
  end

  task :change_locale, [:template_name,:locale_from,:locale_to] => [:environment] do |t, args|
    template = YAML.load open(Rails.root.join('config', 'tenant_templates', "#{args[:template_name]}.yml")).read
    template['models'].each do |_, instances|
      instances.each do |attributes|
        attributes.each do |field_name, multiloc|
          if (field_name =~ /_multiloc$/) && multiloc.is_a?(Hash) && multiloc[args[:locale_to]].blank? && multiloc[args[:locale_from]].present?
            multiloc[args[:locale_to]] = multiloc[args[:locale_from]]
          end
        end
      end
    end
    template['models']['user'].each do |attributes|
      attributes['locale'] = args[:locale_to]
    end
    File.open("config/tenant_templates/#{args[:locale_to]}_#{args[:template_name]}.yml", 'w') { |f| f.write template.to_yaml }
  end

end