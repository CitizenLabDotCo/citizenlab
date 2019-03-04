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
      File.open("config/tenant_templates/generated/#{host.split('.').first}_template.yml", 'w') { |f| f.write template }
    end
  end

  task :change_locale, [:template_name,:locale_from,:locale_to] => [:environment] do |t, args|
    template = open(Rails.root.join('config', 'tenant_templates', "#{args[:template_name]}.yml")).read
    service = TenantTemplateService.new

    template = service.change_locales template, args[:locale_from], args[:locale_to]
    File.open("config/tenant_templates/#{args[:locale_to]}_#{args[:template_name]}.yml", 'w') { |f| f.write template }
  end

end