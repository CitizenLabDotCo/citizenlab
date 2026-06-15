# frozen_string_literal: true

# Two-step workflow — dump, then import the dumped file:
#   rake decidim_importer:dump_yaml[tmp/import_files/example.com.zip,fr-FR]
#     → writes tmp/import_files/example.com.template.yml + tmp/import_files/example.com.app_config.json
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost]
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost,false]  # skip image fetches
#
# Dry-run a dumped template on a throwaway tenant that's created then destroyed:
#   rake decidim_importer:verify[tmp/import_files/example.com.template.yml]
#   rake decidim_importer:verify[tmp/import_files/example.com.template.yml,fr-FR,en]  # tenant locales
#
# `dump_yaml` takes a Decidim export (zip or unzipped dir) and only writes files — it never touches
# a tenant. `import` and `verify` both consume the dumped tenant-template YAML: `import` deserializes
# it into the tenant matching `host` (its 3rd argument disables image fetching, for templates whose
# `remote_*_url` values point at an unreachable host, e.g. the source Decidim's `http://localhost/...`
# redirects); `verify` deserializes it into a fresh throwaway tenant and destroys it afterwards, so a
# template can be smoke-tested without touching a real tenant.
#
# `dump_yaml` also writes `<base>.app_config.json` — the subset of `01--organization.csv` that maps
# onto Go Vocal AppConfiguration settings. `import` looks for that sibling file (same base name,
# `.template.yml` → `.app_config.json`) and merges it into the tenant's AppConfiguration *before*
# applying the template, so the tenant's locales/branding are in place for the imported records.
namespace :decidim_importer do
  desc 'Builds the tenant-template YAML (+ app-config JSON) from a Decidim export (zip or dir). No import.'
  task :dump_yaml, %i[path primary_locale] => [:environment] do |_t, args|
    path = args.fetch(:path)
    importer = build_importer(path, primary_locale: args[:primary_locale] || 'fr-FR')
    builder = importer.build_template

    yaml_path = output_path(path, 'template.yml')
    File.write(yaml_path, builder.to_yaml)
    Rails.logger.info "Wrote #{yaml_path}"
    log_model_summary(builder)
    importer.skipped_phases.each { |s| Rails.logger.warn "  skipped phase #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_components.each { |s| Rails.logger.warn "  skipped component #{s[:component]}: #{s[:reason]}" }
    importer.skipped_participation.each { |s| Rails.logger.warn "  skipped #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_surveys.each { |s| Rails.logger.warn "  skipped #{s[:uid]}: #{s[:reason]}" }
    write_app_config_json(importer, path)
  end

  desc 'Imports a dumped tenant-template YAML file into the tenant matching `host`.'
  task :import, %i[file host import_images] => [:environment] do |_t, args|
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    file = args.fetch(:file)
    import_images = args[:import_images].to_s.downcase != 'false'

    json = app_config_sibling(file)

    Rails.logger.info "Decidim import → tenant=#{tenant.host} file=#{file} import_images=#{import_images}"
    tenant.switch do
      # App config first: it sets the tenant's locales, which the template's records rely on.
      if DecidimImporter::Importer.apply_app_config_file(json, import_images: import_images)
        Rails.logger.info "  applied app config from #{json}"
      else
        Rails.logger.info "  no app-config JSON at #{json} → skipping"
      end
      created = DecidimImporter::Importer.apply_template_file(file, import_images: import_images)
      created.each { |klass, ids| Rails.logger.info "  created #{ids.size} #{klass}" }
    end
    Rails.logger.info 'COMPLETE'
  end

  desc 'Applies a dumped template YAML to a throwaway tenant to confirm it deserializes, then destroys it.'
  task :verify, %i[file locales] => [:environment] do |_t, args|
    file = args.fetch(:file)
    locales = (args[:locales] || 'fr-FR,en').split(/[,\s]+/).compact_blank.uniq

    name = "decidim-verify-#{SecureRandom.hex(4)}"
    host = "#{name}.localhost"
    config_attrs = { settings: SettingsService.new.minimal_required_settings(
      locales: locales, lifecycle_stage: 'demo'
    ) }.with_indifferent_access

    puts "Decidim verify → throwaway tenant=#{host} locales=#{locales.join(',')} file=#{file}"
    success, tenant, = MultiTenancy::TenantService.new.initialize_tenant({ name: name, host: host }, config_attrs)
    raise "failed to create throwaway tenant #{host}" unless success

    begin
      tenant.switch do
        # A throwaway tenant built from minimal settings carries no idea_statuses; imported proposals
        # need the standard ideation ones. Real tenants seed these at creation, so this only fills the
        # gap for the dry-run tenant.
        seed_ideation_statuses
        # Images are skipped: verification is about structure, and exports often carry unreachable
        # `remote_*_url` hosts that would fail the fetch for reasons unrelated to the template.
        created = DecidimImporter::Importer.apply_template_file(file, import_images: false)
        created.each { |klass, ids| puts "  created #{ids.size} #{klass}" }
      end
      puts "VERIFY OK — applied cleanly, tearing down #{host}"
    ensure
      tenant.destroy!
    end
  end

  def seed_ideation_statuses
    # The standard ideation idea_statuses (mirrors the base tenant template); the importer maps Decidim
    # proposal states onto a subset of these.
    codes = %w[prescreening proposed viewed under_consideration accepted implemented rejected ineligible]
    locale = AppConfiguration.instance.settings('core', 'locales').first
    codes.each do |code|
      next if IdeaStatus.exists?(code: code, participation_method: 'ideation')

      label = code.tr('_', ' ')
      IdeaStatus.create!(
        code: code, participation_method: 'ideation', color: '#687782',
        title_multiloc: { locale => label }, description_multiloc: { locale => label }
      )
    end
  end

  # Logs how many of each model the built template will create, in dependency order.
  def log_model_summary(builder)
    counts = builder.model_counts
    Rails.logger.info "Template will create #{counts.values.sum} records:"
    counts.each { |model, count| Rails.logger.info "  #{count} #{model}" }
  end

  # The app-config JSON `dump_yaml` writes beside the template: same base name, with the
  # `.template.yml` suffix swapped for `.app_config.json` (falls back to swapping a plain `.yml`).
  def app_config_sibling(yaml_file)
    candidate = yaml_file.sub(/\.template\.yml\z/i, '.app_config.json')
    candidate = yaml_file.sub(/\.ya?ml\z/i, '.app_config.json') if candidate == yaml_file
    candidate
  end

  # Picks the appropriate Importer factory based on whether `path` is a zip file or a directory.
  def build_importer(path, **opts)
    if File.directory?(path)
      DecidimImporter::Importer.from_directory(path, **opts)
    elsif File.file?(path)
      DecidimImporter::Importer.from_zip(path, **opts)
    else
      raise ArgumentError, "no such file or directory: #{path}"
    end
  end

  # Writes the importer's app-config patch next to the input as `<base>.app_config.json`, unless the
  # export has no organization file (patch empty).
  def write_app_config_json(importer, input_path)
    patch = importer.app_config_patch
    if patch.empty?
      Rails.logger.info '  no organization data → skipping app-config JSON'
      return
    end

    json_path = output_path(input_path, 'app_config.json')
    File.write(json_path, JSON.pretty_generate(patch))
    Rails.logger.info "Wrote #{json_path}"
  end

  # Drops the input's extension and appends `.<suffix>`, keeping the same parent directory.
  # `/tmp/example.zip`, 'template.yml' => `/tmp/example.template.yml`; a directory `/tmp/example`
  # keeps its name.
  def output_path(input_path, suffix)
    normalized = input_path.chomp('/')
    parent = File.dirname(normalized)
    base = File.basename(normalized, File.extname(normalized))
    File.join(parent, "#{base}.#{suffix}")
  end
end
