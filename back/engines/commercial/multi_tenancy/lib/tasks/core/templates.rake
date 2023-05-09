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
    tenant = Tenant.find_by(host: args[:host])
    template = MultiTenancy::Templates::TenantSerializer.new(tenant, uploads_full_urls: true).run
    File.write(args[:file], template.to_yaml)
  end

  task :import, %i[host file] => [:environment] do |_t, args|
    Tenant.find_by(host: args[:host]).switch do
      serialized_models = YAML.load(File.read(args[:file]))
      MultiTenancy::Templates::TenantDeserializer.new.deserialize(serialized_models)
    end
  end

  task :generate, [:s3_prefix] => [:environment] do |_t, args|
    s3_prefix = args[:s3_prefix] || MultiTenancy::Templates::Utils.new.test_prefix

    template_creator = MultiTenancy::Templates::CreateService.new(
      tenant_bucket: ENV.fetch('AWS_S3_BUCKET', 'cl2-tenants-production-benelux'),
      template_bucket: ENV.fetch('TEMPLATE_BUCKET', 'cl2-tenant-templates')
    )

    template_host_suffix = ENV.fetch('TEMPLATE_URL_SUFFIX', '.localhost')
    template_tenants = Tenant.where("host LIKE '%#{template_host_suffix}'")
    puts({ event: 'templates_generation', nb_templates: template_tenants.size }.to_json)

    template_tenants.each do |template_tenant|
      puts({ event: 'template_creation', tenant_id: template_tenant.id, tenant_host: template_tenant.host }.to_json)
      template_creator.create(template_tenant, prefix: s3_prefix)
    end
    puts({ event: 'templates_generation_finished', prefix: s3_prefix }.to_json)
  end

  task :verify, [:output_file] => [:environment] do |_t, args|
    test_prefix = MultiTenancy::Templates::Utils.new.test_prefix
    templates = MultiTenancy::Templates::Utils.new.available_external_templates(prefix: test_prefix)
    puts({ event: 'templates_verification', prefix: test_prefix, nb_templates: templates.size }.to_json)
    next if templates.empty?

    default_max_time = 3.hours / templates.size

    failed_templates = templates.filter_map do |template|
      max_time = MAX_VERIFICATION_TIMES[template]&.minutes || default_max_time
      puts({ event: 'template_verification', template: template }.to_json)
      verify_template(template, max_time, test_prefix)
      nil
    rescue StandardError => e
      ErrorReporter.report(e)
      "#{template}: #{e.message}"
    end

    report_content = failed_templates.join("\n") + "\n" # rubocop:disable Style/StringConcatenation
    File.write(args[:output_file], report_content)
  end

  task :release, [:failed_templates_file] => [:environment] do |_t, args|
    failed_template_file = args[:failed_templates_file]
    failed_templates = if failed_template_file.present?
      File.readlines(failed_template_file).map(&:strip).filter_map(&:presence)
    else
      []
    end

    if failed_templates.present?
      puts({ event: 'templates_release', status: 'failed', failed_templates: failed_templates }.to_json)
      next
    end

    release_prefix = MultiTenancy::Templates::Utils.new.release_templates
    puts({ event: 'templates_release', status: 'success', release_prefix: release_prefix }.to_json)
  end

  task :change_locale, %i[template_name locale_from locale_to] => [:environment] do |_t, args|
    template_path = Rails.root.join('config/tenant_templates', "#{args[:template_name]}.yml")
    serialized_models = YAML.load(File.read(template_path))

    serialized_models = MultiTenancy::Templates::Utils.change_locales(
      serialized_models,
      args[:locale_from],
      args[:locale_to]
    )

    output_filename = "#{args[:locale_to]}_#{args[:template_name]}.yml"
    output_path = Rails.root.join('config/tenant_templates', output_filename)
    File.write(output_path, serialized_models.to_yaml)
  end

  def verify_template(template_name, max_time, prefix)
    template_utils = MultiTenancy::Templates::Utils.new
    locales = template_utils.required_locales(template_name, external_subfolder: prefix)
    locales = ['en'] if locales.blank?

    name = template_name.tr('._', '-')
    host = "#{name}-#{SecureRandom.uuid}.localhost"
    tenant_attrs = { name: name, host: host }
    config_attrs = { settings: SettingsService.new.minimal_required_settings(
      locales: locales,
      lifecycle_stage: 'demo'
    ) }.with_indifferent_access

    _success, tenant, _app_config = MultiTenancy::TenantService.new.initialize_tenant(
      tenant_attrs, config_attrs
    )

    tenant.switch do
      puts "Verifying #{template_name}"
      template = MultiTenancy::Templates::Utils.new.fetch_external_template_models(template_name, prefix: prefix)
      MultiTenancy::Templates::TenantSerializer.format_for_deserializer!(template)

      MultiTenancy::Templates::TenantDeserializer.new.deserialize(template, max_time: max_time)
    end
  ensure
    tenant&.destroy!
  end
end
