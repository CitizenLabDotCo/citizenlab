require 'yaml'


namespace :templates do
  desc "Importing and exporting tenants as yaml files"

  task :export, [:host,:file] => [:environment] do |t, args|
    template = ::MultiTenancy::Templates::Serializer.new(Tenant.find_by(host: args[:host])).run
    File.open(args[:file], 'w') { |f| f.write template.to_yaml }
  end

  task :import, [:host,:file] => [:environment] do |t, args|
    host = args[:host]
    Apartment::Tenant.switch(host.gsub('.', '_')) do
      ::MultiTenancy::TenantTemplateService.new.resolve_and_apply_template YAML.load(open(args[:file]).read)
    end
  end

  task :generate, [:external] => [:environment] do |t, args|
    external = args[:external] || false
    template_hosts = Tenant.pluck(:host).select do |host|
      host.ends_with? ENV.fetch('TEMPLATE_URL_SUFFIX','.localhost') # '.template.citizenlab.co'
    end

    s3 = Aws::S3::Resource.new client: Aws::S3::Client.new(region: 'eu-central-1')
    template_hosts.each do |host|
      template = ::MultiTenancy::Templates::Serializer.new(Tenant.find_by(host: host)).run
      if template.to_yaml.size < 5.megabytes
        template_name = "#{host.split('.').first}_template.yml"
        file_path = "config/tenant_templates/generated/#{template_name}"
        File.open(file_path, 'w') { |f| f.write template.to_yaml }
        if external
          s3.bucket(ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates')).object("test/#{template_name}").upload_file(file_path)
        end
      else
        puts "Skipping template #{template_name} which exceeds size limit"
      end
    end
  end

  task :verify, [:output_file] => [:environment] do |t, args|
    failed_templates = []
    service = MultiTenancy::TenantTemplateService.new
    MultiTenancy::TenantTemplateService.new.available_templates(external_subfolder: 'test')[:external].map do |template|
      locales = MultiTenancy::TenantTemplateService.new.required_locales(template, external_subfolder: 'test')
      locales = ['en'] if locales.blank?
      name = template.split('_').join('')
      tn = Tenant.create!(
        name: name,
        host: "#{name}.localhost",
        settings: {core: {allowed: true, enabled: true, locales: locales, lifecycle_stage: 'demo'}}
        )

      Apartment::Tenant.switch(tn.schema_name) do
        puts "Verifying #{template}"
        begin
          service.resolve_and_apply_template template, external_subfolder: 'test'
        rescue StandardError => e
          puts "Template application #{template} failed!"
          puts e.message
          ErrorReporter.report(e)
          failed_templates += [template]
        end
      end

      tn.destroy!
    end
    File.open(args[:output_file], 'w+') do |f|
      failed_templates.each { |template| f.puts template }
    end
  end

  task :release, [:failed_templates_file] => [:environment] do |t, args|
    failed_templates = []
    failed_templates += File.readlines(args[:failed_templates_file]).map(&:strip) if args[:failed_templates_file]

    s3 = Aws::S3::Resource.new client: Aws::S3::Client.new(region: 'eu-central-1')
    bucket = s3.bucket(ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'))
    bucket.objects(prefix: 'release').each(&:delete)
    bucket.objects(prefix: 'test').each do |template|
      template_name = "#{template.key}"
      template_name.slice! 'test/'
      if template_name.present? && !failed_templates.include?(template_name.split('.').first)
        template.copy_to(bucket: ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'), key: "release/#{template_name}")
      end
    end

    if failed_templates.present?
      raise "Some templates are invalid: #{failed_templates.join(', ')}"
    end
  end

  task :change_locale, [:template_name,:locale_from,:locale_to] => [:environment] do |t, args|
    template = YAML.load open(Rails.root.join('config', 'tenant_templates', "#{args[:template_name]}.yml")).read
    service = ::MultiTenancy::TenantTemplateService.new

    template = service.change_locales template, args[:locale_from], args[:locale_to]
    File.open("config/tenant_templates/#{args[:locale_to]}_#{args[:template_name]}.yml", 'w') { |f| f.write template.to_yaml }
  end

end
