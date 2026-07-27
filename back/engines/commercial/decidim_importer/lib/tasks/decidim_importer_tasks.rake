# frozen_string_literal: true

require 'csv'

# Two-step workflow: `dump_yaml` reads a Decidim export (zip or dir) and writes the artifacts
# (`.template.yml` + `.app_config.json` + `.url_mapping.csv`) — it never touches a tenant; `import`
# applies them to the tenant matching `host`. `verify` dry-runs a dumped template on a throwaway tenant.
#
#   rake decidim_importer:dump_yaml[tmp/import_files/example.com.zip,fr-FR]
#   rake decidim_importer:dump_yaml[tmp/import_files/example.com.zip,fr-FR,false,true]  # include_source_url
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost]
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost,false]  # skip image fetches
#   rake decidim_importer:verify[tmp/import_files/example.com.template.yml,fr-FR,en]
#
# `import` refuses to run unless the `decidim_importer` feature is enabled for the target host (a
# per-tenant safety gate, off by default — enable it in admin HQ). It applies the `.app_config.json`
# (locales/branding) first, deserializes the template, then finishes by rewriting embedded Decidim
# links via the `.url_mapping.csv` (unresolved ones → `<base>.broken_links.csv`) and building the
# Consultations/Assemblies folder structure. The 3rd arg disables image fetching (for templates whose
# `remote_*_url`s point at an unreachable host).
namespace :decidim_importer do
  desc 'Builds the tenant-template YAML (+ app-config JSON) from a Decidim export (zip or dir). No import.'
  task :dump_yaml, %i[path primary_locale production include_source_url] => [:environment] do |_t, args|
    path = args.fetch(:path)
    # `production=true` keeps real user names/emails; otherwise they're anonymised.
    production = args[:production].to_s.strip.downcase == 'true'
    # `include_source_url=true` prepends a link back to each project's original Decidim URL.
    include_source_url = args[:include_source_url].to_s.strip.downcase == 'true'
    importer = build_importer(
      path, primary_locale: args[:primary_locale] || 'fr-FR', anonymize_users: !production,
      include_source_url: include_source_url
    )
    builder = importer.build_template

    yaml_path = output_path(path, 'template.yml')
    File.write(yaml_path, builder.to_yaml)
    Rails.logger.info "Wrote #{yaml_path} (users #{production ? 'untouched (production)' : 'anonymised'})"
    log_model_summary(builder)
    importer.skipped_components.each { |s| Rails.logger.warn "  skipped component #{s[:component]}: #{s[:reason]}" }
    importer.skipped_categories.each { |s| Rails.logger.warn "  skipped category #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_participation.each { |s| Rails.logger.warn "  skipped #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_results.each { |s| Rails.logger.warn "  skipped result #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_followers.each { |s| Rails.logger.warn "  skipped follow #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_endorsements.each { |s| Rails.logger.warn "  skipped endorsement #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_comment_votes.each { |s| Rails.logger.warn "  skipped comment vote #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_budget_projects.each { |s| Rails.logger.warn "  skipped budget project #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_orders.each { |s| Rails.logger.warn "  skipped order #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_proposal_attachments.each { |s| Rails.logger.warn "  skipped attachment #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_surveys.each { |s| Rails.logger.warn "  skipped #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_survey_responses.each { |s| Rails.logger.warn "  skipped response #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_pages.each { |s| Rails.logger.warn "  skipped page #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_blog_posts.each { |s| Rails.logger.warn "  skipped blog post #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_meetings.each { |s| Rails.logger.warn "  skipped meeting #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_meeting_attachments.each { |s| Rails.logger.warn "  skipped meeting attachment #{s[:uid]}: #{s[:reason]}" }
    importer.skipped_files.each { |s| Rails.logger.warn "  skipped file #{s[:uid]}: #{s[:reason]}" }
    write_app_config_json(importer, path)
    write_url_mapping_csv(importer, path)
  end

  desc 'Imports a dumped tenant-template YAML file into the tenant matching `host`, then runs the ' \
       'post-import finishing (link correction + Consultations/Assemblies folder structure).'
  task :import, %i[file host import_images] => [:environment] do |_t, args|
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    file = args.fetch(:file)
    import_images = args[:import_images].to_s.downcase != 'false'

    ensure_import_enabled!(tenant)
    json = app_config_sibling(file)

    Rails.logger.info "Decidim import → tenant=#{tenant.host} file=#{file} import_images=#{import_images}"
    broken = []
    tenant.switch do
      # App config first — it sets the tenant's locales, which the template's records rely on.
      if DecidimImporter::Importer.apply_app_config_file(json, import_images: import_images)
        Rails.logger.info "  applied app config from #{json}"
      else
        Rails.logger.info "  no app-config JSON at #{json} → skipping"
      end
      created = DecidimImporter::Importer.apply_template_file(file, import_images: import_images)
      created.each { |klass, ids| Rails.logger.info "  created #{ids.size} #{klass}" }

      broken = finalize_import!(file)
    end
    write_broken_links_csv(url_mapping_path(file), broken)
    Rails.logger.info 'COMPLETE'
  end

  desc 'Applies a dumped template YAML to a throwaway tenant to confirm it deserializes, then destroys it.'
  task :verify, %i[file locales import_images] => [:environment] do |_t, args|
    file = args.fetch(:file)
    locales = (args[:locales] || 'fr-FR,en').split(/[,\s]+/).compact_blank.uniq
    # Images are skipped by default (verification is about structure); `import_images=true` fetches them.
    import_images = args[:import_images].to_s.strip.downcase == 'true'

    name = "decidim-verify-#{SecureRandom.hex(4)}"
    host = "#{name}.localhost"
    config_attrs = { settings: SettingsService.new.minimal_required_settings(
      locales: locales, lifecycle_stage: 'demo'
    ) }.with_indifferent_access

    puts "Decidim verify → throwaway tenant=#{host} locales=#{locales.join(',')} file=#{file}"
    # Build from the `base` template (applied sync) so the tenant carries the standard idea statuses etc.
    # a real tenant has. Locales must include the base template's `en`, which the `fr-FR,en` default covers.
    success, tenant, = MultiTenancy::TenantService.new
      .initialize_with_template({ name: name, host: host }, config_attrs, 'base', apply_template_sync: true)
    raise "failed to create throwaway tenant #{host}" unless success

    begin
      tenant.switch do
        created = DecidimImporter::Importer.apply_template_file(file, import_images: import_images)
        created.each { |klass, ids| puts "  created #{ids.size} #{klass}" }
      end
      puts "VERIFY OK — applied cleanly, tearing down #{host}"
    ensure
      tenant.destroy!
    end
  end

  # Aborts the import unless the target tenant has the `decidim_importer` feature on (safety gate,
  # toggled in admin HQ).
  def ensure_import_enabled!(tenant)
    return if tenant.switch { AppConfiguration.instance.feature_activated?('decidim_importer') }

    abort "Refusing to import: the 'decidim_importer' feature is not enabled for #{tenant.host}. " \
          'Enable it for this host in admin HQ first, after confirming it is the right tenant.'
  end

  # Post-import finishing (in the tenant): rewrite embedded Decidim links (when a mapping exists), then
  # build the Consultations/Assemblies folder structure. Returns the broken links for the report.
  def finalize_import!(file)
    mapping_path = url_mapping_path(file)
    broken =
      if File.exist?(mapping_path)
        rewriter = DecidimImporter::Links::Rewriter.from_csv(mapping_path)
        result = rewriter.run
        Rails.logger.info "  rewrote links in #{rewriter.updated_count} record(s)"
        result
      else
        Rails.logger.info "  no URL mapping at #{mapping_path} → skipping link correction"
        []
      end

    consultations = DecidimImporter::ConsultationsFolder.new.run
    Rails.logger.info "  Consultations folder #{consultations[:folder].slug}: " \
                      "moved #{consultations[:moved_projects].size} project(s) in"
    broken
  end

  # Logs the record counts the built template will create: overall, then per project, then a shared
  # bucket for records not tied to a project.
  def log_model_summary(builder)
    counts = builder.model_counts
    Rails.logger.info "Template will create #{counts.values.sum} records:"
    counts.each { |model, count| Rails.logger.info "  #{count} #{model}" }
    log_per_project_summary(builder)
  end

  def log_per_project_summary(builder)
    by_project = builder.counts_by_project
    by_project.each do |project, counts|
      next if project.nil?

      Rails.logger.info "#{project_title(project)} (#{counts.values.sum} records):"
      counts.each { |model, count| Rails.logger.info "  #{count} #{model}" }
    end

    shared = by_project[nil]
    return if shared.blank?

    Rails.logger.info "Not project-scoped (#{shared.values.sum} records):"
    shared.each { |model, count| Rails.logger.info "  #{count} #{model}" }
  end

  def project_title(project)
    title = project.attributes['title_multiloc']
    (title.is_a?(Hash) && title.values.find(&:present?)) || '(untitled project)'
  end

  # `<base>.app_config.json` beside the template (its `.template.yml`/`.yml` suffix swapped).
  def app_config_sibling(yaml_file)
    candidate = yaml_file.sub(/\.template\.yml\z/i, '.app_config.json')
    candidate = yaml_file.sub(/\.ya?ml\z/i, '.app_config.json') if candidate == yaml_file
    candidate
  end

  # Picks the Importer factory by whether `path` is a zip file or a directory.
  def build_importer(path, **opts)
    if File.directory?(path)
      DecidimImporter::Importer.from_directory(path, **opts)
    elsif File.file?(path)
      DecidimImporter::Importer.from_zip(path, **opts)
    else
      raise ArgumentError, "no such file or directory: #{path}"
    end
  end

  # Writes the app-config patch as `<base>.app_config.json` (skipped when the export has no org file).
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

  # Writes the old→new link mapping as `<base>.url_mapping.csv` (skipped when there are none), applied
  # to the tenant during `import`'s finishing.
  def write_url_mapping_csv(importer, input_path)
    map = importer.link_map
    if map.empty?
      Rails.logger.info '  no correctable links → skipping URL mapping CSV'
      return
    end

    csv_path = output_path(input_path, 'url_mapping.csv')
    map.write_csv(csv_path)
    Rails.logger.info "Wrote #{csv_path} (#{map.resolved_count} mapped, #{map.broken.size} broken)"
  end

  # The URL-mapping CSV for a path: the path itself if a `.csv`, else the template path with its
  # `.template.yml`/`.yml` suffix swapped for `.url_mapping.csv`.
  def url_mapping_path(arg)
    return arg if arg.downcase.end_with?('.csv')

    candidate = arg.sub(/\.template\.yml\z/i, '.url_mapping.csv')
    candidate == arg ? arg.sub(/\.ya?ml\z/i, '.url_mapping.csv') : candidate
  end

  # Writes the unresolved links as `<base>.broken_links.csv` (no-op when there are none).
  def write_broken_links_csv(mapping_path, broken)
    if broken.empty?
      Rails.logger.info '  no broken links'
      return
    end

    path = mapping_path.sub(/\.url_mapping\.csv\z/i, '.broken_links.csv')
    path = "#{mapping_path}.broken_links.csv" if path == mapping_path
    CSV.open(path, 'w') do |csv|
      csv << %w[old_url container_type container_id]
      broken.uniq { |row| [row[:old_url], row[:container_id]] }
        .each { |row| csv << [row[:old_url], row[:container_type], row[:container_id]] }
    end
    Rails.logger.warn "Wrote #{path} (#{broken.size} broken link occurrence(s))"
  end

  # Swaps the input's extension for `.<suffix>`, keeping the parent dir. `/tmp/x.zip`,'template.yml'
  # → `/tmp/x.template.yml`; a directory keeps its name.
  def output_path(input_path, suffix)
    normalized = input_path.chomp('/')
    parent = File.dirname(normalized)
    base = File.basename(normalized, File.extname(normalized))
    File.join(parent, "#{base}.#{suffix}")
  end
end
