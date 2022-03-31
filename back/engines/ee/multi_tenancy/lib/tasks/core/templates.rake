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
      template_name = "#{host.split('.').first}_template.yml"
      file_path = "config/tenant_templates/generated/#{template_name}"
      File.open(file_path, 'w') { |f| f.write template.to_yaml }
      if external
        s3.bucket(ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates')).object("test/#{template_name}").upload_file(file_path)
      end
    end
  end

  task :verify, [:output_file] => [:environment] do |t, args|
    pool_size = 1 # 4 # Debugging
    failed_templates = []
    templates = MultiTenancy::TenantTemplateService.new.available_templates(
      external_subfolder: 'test'
    )[:external]
    templates.in_groups_of(pool_size).map(&:compact).map do |pool_templates|
      futures = pool_templates.map do |template|
        [template, Concurrent::Future.execute { verify_template template }]
      end.to_h
      sleep 1 until futures.values.all?(&:complete?)

      futures.select do |_, future|
        future.rejected?
      end.map do |template, future|
        puts "Template application #{template} failed!"
        puts future.reason.message
        ErrorReporter.report future.reason
        failed_templates += [template]
      end
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

  def verify_template(template)
    service = MultiTenancy::TenantTemplateService.new
    locales = service.required_locales(template, external_subfolder: 'test')
    locales = ['en'] if locales.blank?
    name = template.split('_').join('')
    tn_attributes = {
      name: name,
      host: "#{name}.localhost",
      settings: SettingsService.new.minimal_required_settings(
        locales: locales,
        lifecycle_stage: 'demo'
      )
    }
    tn = Tenant.create! tn_attributes

    Apartment::Tenant.switch(tn.schema_name) do
      puts "Verifying #{template}"
      service.resolve_and_apply_template template, external_subfolder: 'test', max_time: 45.minutes
    end

    tn.destroy!
  end
end
