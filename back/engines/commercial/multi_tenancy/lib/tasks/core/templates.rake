# frozen_string_literal: true

require 'yaml'

# Estimated maximum times in minutes needed to verify specific templates on CI.
# Interim solution. We should find better. For discussion and ideas, see:
# https://citizenlab.atlassian.net/browse/CL-1588
MAX_VERIFICATION_TIMES = {
  'global-demo_template' => 14,
  'insights_template' => 15,
  'mi-municipio_template' => 15,
  'trial-en_template' => 23
}.freeze

namespace :templates do
  desc 'Importing and exporting tenants as yaml files'

  task :export, %i[host file] => [:environment] do |_t, args|
    template = MultiTenancy::Templates::Serializer.new(Tenant.find_by(host: args[:host])).run
    File.write(args[:file], template.to_yaml)
  end

  task :import, %i[host file] => [:environment] do |_t, args|
    host = args[:host]
    Apartment::Tenant.switch(host.tr('.', '_')) do
      MultiTenancy::TenantTemplateService.new.resolve_and_apply_template YAML.load(open(args[:file]).read)
    end
  end

  task :generate, [:external] => [:environment] do |_t, args|
    external = args[:external] || false
    template_hosts = Tenant.pluck(:host).select do |host|
      host.ends_with? ENV.fetch('TEMPLATE_URL_SUFFIX', '.localhost') # '.template.citizenlab.co'
    end

    s3 = Aws::S3::Resource.new client: Aws::S3::Client.new(region: 'eu-central-1')
    template_hosts.each do |host|
      template_name = "#{host.split('.').first}_template.yml"
      puts "Generating #{template_name}"
      template = MultiTenancy::Templates::Serializer.new(Tenant.find_by(host: host)).run
      file_path = "config/tenant_templates/generated/#{template_name}"
      File.write(file_path, template.to_yaml)
      if external
        s3.bucket(ENV.fetch('TEMPLATE_BUCKET',
          'cl2-tenant-templates')).object("test/#{template_name}").upload_file(file_path)
      end
    end
  end

  task :verify, [:output_file] => [:environment] do |_t, args|
    pool_size = 1 # 4 # Debugging
    failed_templates = []
    templates = MultiTenancy::TenantTemplateService.new.available_templates(
      external_subfolder: 'test'
    )[:external]
    templates.in_groups_of(pool_size).map(&:compact).map do |pool_templates|
      futures = pool_templates.index_with do |template|
        unless templates.empty?
          max_time = if MAX_VERIFICATION_TIMES.key?(template)
            MAX_VERIFICATION_TIMES[template].minutes
          else
            3.hours / templates.size
          end
        end
        Concurrent::Future.execute { verify_template template, max_time }
      end
      sleep 1 until futures.values.all?(&:complete?)

      rejected_futures = futures.select do |_, future|
        future.rejected?
      end
      rejected_futures.map do |template, future|
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

  task :release, [:failed_templates_file] => [:environment] do |_t, args|
    failed_templates = []
    failed_templates += File.readlines(args[:failed_templates_file]).map(&:strip) if args[:failed_templates_file]

    s3 = Aws::S3::Resource.new client: Aws::S3::Client.new(region: 'eu-central-1')
    bucket = s3.bucket(ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'))
    # The release folder itself is also returned as an object, but should not be deleted.
    bucket.objects(prefix: 'release').reject { |obj| obj.key == 'release/' }.each(&:delete)

    # This code no longer works due to a bug in AWS S3: the folder part of the keys has disappeared.
    # bucket.objects(prefix: 'test') # .reject { |obj| obj.key == 'test/' }
    #   .each do |template|
    #   template_name = template.key.to_s
    #   template_name.slice! 'test/'
    #   if template_name.present? && failed_templates.exclude?(template_name.split('.').first)
    #     template.copy_to(bucket: ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates'), key: "release/#{template_name}")
    #   end
    # end

    bucket.objects(prefix: 'test').reject { |obj| obj.key == 'test/' }.each do |template|
      # Download
      template_name = template.key.to_s
      template_name.slice! 'test/'
      template_object = bucket.object("test/#{template_name}")
      template_content = template_object.get.body.read

      # Upload
      bucket.object("release/#{template_name}").upload_stream do |stream|
        stream << template_content
      end
    end

    if failed_templates.present?
      raise "Some templates are invalid: #{failed_templates.join(', ')}"
    end
  end

  task :change_locale, %i[template_name locale_from locale_to] => [:environment] do |_t, args|
    template = YAML.load open(Rails.root.join('config', 'tenant_templates', "#{args[:template_name]}.yml")).read
    service = MultiTenancy::TenantTemplateService.new

    template = service.change_locales template, args[:locale_from], args[:locale_to]
    File.write("config/tenant_templates/#{args[:locale_to]}_#{args[:template_name]}.yml", template.to_yaml)
  end

  def verify_template(template, max_time)
    template_service = MultiTenancy::TenantTemplateService.new
    locales = template_service.required_locales(template, external_subfolder: 'test')
    locales = ['en'] if locales.blank?

    name = template.split('_').join
    tenant_attrs = { name: name, host: "#{name}.localhost" }
    config_attrs = { settings: SettingsService.new.minimal_required_settings(
      locales: locales,
      lifecycle_stage: 'demo'
    ) }.with_indifferent_access

    _success, tenant, _app_config = MultiTenancy::TenantService.new.initialize_tenant(
      tenant_attrs, config_attrs
    )

    tenant.switch do
      puts "Verifying #{template}"
      template_service.resolve_and_apply_template(template, external_subfolder: 'test', max_time: max_time)
    end

    tenant.destroy!
  end
end
