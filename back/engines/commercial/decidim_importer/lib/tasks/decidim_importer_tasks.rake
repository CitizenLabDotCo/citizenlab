# frozen_string_literal: true

require 'csv'

# Workflow: `create_template` reads a Decidim export (zip or dir) and writes the artifacts
# (`.template.yml` + `.app_config.json` + `.url_mapping.csv`) — it never touches a tenant. `import`
# applies the template to the tenant matching `host` (unioning in the export's locales so it
# deserializes). `update_app_config` applies the *full* `.app_config.json` (replaces locales, branding,
# reply-to) — optional, run only when you want the tenant to match the export. `verify` dry-runs a
# template on a throwaway tenant. Each of `create_template`/`import`/`update_app_config` tees its summary
# to a run log beside the artifacts: `<base>.create.log` / `<base>.import.log` / `<base>.app_config.log`.
#
#   rake decidim_importer:create_template[tmp/import_files/example.com.zip,fr-FR]
#   rake decidim_importer:create_template[tmp/import_files/example.com.zip,fr-FR,false,true]  # include_source_url
#   rake decidim_importer:update_app_config[tmp/import_files/example.com.template.yml,localhost]
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost]
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost,false]  # skip image fetches
#   rake decidim_importer:verify[tmp/import_files/example.com.template.yml,fr-FR,en]
#
# `import` and `update_app_config` refuse to run unless the `decidim_importer` feature is enabled for the
# target host (a per-tenant safety gate, off by default — enable it in admin HQ). `import` deserializes
# the template, then finishes by rewriting embedded Decidim links via the `.url_mapping.csv` (unresolved
# ones → `<base>.broken_links.csv`) and building the Consultations/Assemblies folder structure. The 3rd
# arg disables image fetching (for templates whose `remote_*_url`s point at an unreachable host).
namespace :decidim_importer do
  desc 'Builds the tenant-template YAML (+ app-config JSON) from a Decidim export (zip or dir). No import.'
  task :create_template, %i[path primary_locale production include_source_url] => [:environment] do |_t, args|
    path = args.fetch(:path)
    # `production=true` keeps real user names/emails; otherwise they're anonymised.
    production = args[:production].to_s.strip.downcase == 'true'
    # `include_source_url=true` prepends a link back to each project's original Decidim URL.
    include_source_url = args[:include_source_url].to_s.strip.downcase == 'true'
    creator = build_creator(
      path, primary_locale: args[:primary_locale] || 'fr-FR', anonymize_users: !production,
      include_source_url: include_source_url
    )
    builder = creator.build_template

    with_report_log(log_path(path, 'create')) do
      yaml_path = output_path(path, 'template.yml')
      File.write(yaml_path, builder.to_yaml)
      report_line "Wrote #{yaml_path} (users #{production ? 'untouched (production)' : 'anonymised'})"
      log_model_summary(builder)
      creator.skipped_components.each { |s| report_warn "  skipped component #{s[:component]}: #{s[:reason]}" }
      creator.skipped_categories.each { |s| report_warn "  skipped category #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_participation.each { |s| report_warn "  skipped #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_results.each { |s| report_warn "  skipped result #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_debates.each { |s| report_warn "  skipped debate #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_followers.each { |s| report_warn "  skipped follow #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_endorsements.each { |s| report_warn "  skipped endorsement #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_comment_votes.each { |s| report_warn "  skipped comment vote #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_proposal_notes.each { |s| report_warn "  skipped proposal note #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_budget_projects.each { |s| report_warn "  skipped budget project #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_orders.each { |s| report_warn "  skipped order #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_proposal_attachments.each { |s| report_warn "  skipped attachment #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_surveys.each { |s| report_warn "  skipped #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_survey_responses.each { |s| report_warn "  skipped response #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_pages.each { |s| report_warn "  skipped page #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_blog_posts.each { |s| report_warn "  skipped blog post #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_meetings.each { |s| report_warn "  skipped meeting #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_meeting_attachments.each { |s| report_warn "  skipped meeting attachment #{s[:uid]}: #{s[:reason]}" }
      creator.skipped_files.each { |s| report_warn "  skipped file #{s[:uid]}: #{s[:reason]}" }
      write_app_config_json(creator, path)
      write_url_mapping_csv(creator, path)
    end
  end

  desc 'Imports a dumped tenant-template YAML file into the tenant matching `host`, then runs the ' \
       'post-import finishing (link correction + Consultations/Assemblies folder structure). Unions the ' \
       'export\'s locales into the tenant (additive) so the template deserializes; run `update_app_config` ' \
       'for the rest of the app config (locale replace, branding, reply-to).'
  task :import, %i[file host import_uploads] => [:environment] do |_t, args|
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    file = args.fetch(:file)
    import_uploads = args[:import_uploads].to_s.downcase != 'false'

    ensure_import_enabled!(tenant)

    with_report_log(log_path(file, 'import')) do
      report_line "Decidim import → tenant=#{tenant.host} file=#{file} import_uploads=#{import_uploads}"
      broken = []
      tenant.switch do
        # Ensure the tenant has every locale the template's multilocs reference (additive union), so
        # deserialize doesn't fail on a missing locale. Full app config is `update_app_config`.
        added = DecidimImporter::Importer.merge_app_config_locales_file(app_config_sibling(file))
        report_line "  added locales #{added.join(', ')}" if added.any?

        created = DecidimImporter::Importer.apply_template_file(file, import_uploads: import_uploads)
        created.each { |klass, ids| report_line "  created #{ids.size} #{klass}" }

        broken = finalize_import!(file)
      end
      write_broken_links_csv(url_mapping_path(file), broken)
      report_line 'COMPLETE'
    end
  end

  desc 'Applies the full dumped `.app_config.json` to the tenant matching `host`: **replaces** the ' \
       'locale set (migrating stranded users), branding and reply-to. Optional — `import` already unions ' \
       'the locales it needs; run this only when you want the tenant to match the export.'
  task :update_app_config, %i[file host import_uploads] => [:environment] do |_t, args|
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    file = args.fetch(:file)
    import_uploads = args[:import_uploads].to_s.downcase != 'false'

    ensure_import_enabled!(tenant)
    json = app_config_sibling(file)

    with_report_log(log_path(file, 'app_config')) do
      report_line "Decidim app-config update → tenant=#{tenant.host} file=#{json} import_uploads=#{import_uploads}"
      tenant.switch do
        if DecidimImporter::Importer.apply_app_config_file(json, import_uploads: import_uploads)
          report_line "  applied app config from #{json}"
        else
          report_line "  no app-config JSON at #{json} → nothing to apply"
        end
      end
      report_line 'COMPLETE'
    end
  end

  desc 'Applies a dumped template YAML to a throwaway tenant to confirm it deserializes, then destroys it.'
  task :verify, %i[file locales import_uploads] => [:environment] do |_t, args|
    file = args.fetch(:file)
    locales = (args[:locales] || 'fr-FR,en').split(/[,\s]+/).compact_blank.uniq
    # Uploads are skipped by default (verification is about structure); `import_uploads=true` fetches them.
    import_uploads = args[:import_uploads].to_s.strip.downcase == 'true'

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
        created = DecidimImporter::Importer.apply_template_file(file, import_uploads: import_uploads)
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
        report_line "  rewrote links in #{rewriter.updated_count} record(s)"
        result
      else
        report_line "  no URL mapping at #{mapping_path} → skipping link correction"
        []
      end

    consultations = DecidimImporter::ConsultationsFolder.new.run
    report_line "  Consultations folder #{consultations[:folder].slug}: " \
                "moved #{consultations[:moved_projects].size} project(s) in"
    broken
  end

  # Logs the record counts the built template will create: overall, then per project, then a shared
  # bucket for records not tied to a project.
  def log_model_summary(builder)
    counts = builder.model_counts
    report_line "Template will create #{counts.values.sum} records:"
    counts.each { |model, count| report_line "  #{count} #{model}" }
    log_per_project_summary(builder)
  end

  def log_per_project_summary(builder)
    by_project = builder.counts_by_project
    by_project.each do |project, counts|
      next if project.nil?

      report_line "#{project_title(project)} (#{counts.values.sum} records):"
      counts.each { |model, count| report_line "  #{count} #{model}" }
    end

    shared = by_project[nil]
    return if shared.blank?

    report_line "Not project-scoped (#{shared.values.sum} records):"
    shared.each { |model, count| report_line "  #{count} #{model}" }
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

  # Picks the TemplateCreator factory by whether `path` is a zip file or a directory.
  def build_creator(path, **opts)
    if File.directory?(path)
      DecidimImporter::TemplateCreator.from_directory(path, **opts)
    elsif File.file?(path)
      DecidimImporter::TemplateCreator.from_zip(path, **opts)
    else
      raise ArgumentError, "no such file or directory: #{path}"
    end
  end

  # Writes the app-config patch as `<base>.app_config.json` (skipped when the export has no org file).
  def write_app_config_json(creator, input_path)
    patch = creator.app_config_patch
    if patch.empty?
      report_line '  no organization data → skipping app-config JSON'
      return
    end

    json_path = output_path(input_path, 'app_config.json')
    File.write(json_path, JSON.pretty_generate(patch))
    report_line "Wrote #{json_path}"
  end

  # Writes the old→new link mapping as `<base>.url_mapping.csv` (skipped when there are none), applied
  # to the tenant during `import`'s finishing.
  def write_url_mapping_csv(creator, input_path)
    map = creator.link_map
    if map.empty?
      report_line '  no correctable links → skipping URL mapping CSV'
      return
    end

    csv_path = output_path(input_path, 'url_mapping.csv')
    map.write_csv(csv_path)
    report_line "Wrote #{csv_path} (#{map.resolved_count} mapped, #{map.broken.size} broken)"
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
      report_line '  no broken links'
      return
    end

    path = mapping_path.sub(/\.url_mapping\.csv\z/i, '.broken_links.csv')
    path = "#{mapping_path}.broken_links.csv" if path == mapping_path
    CSV.open(path, 'w') do |csv|
      csv << %w[old_url container_type container_id container_url]
      broken.uniq { |row| [row[:old_url], row[:container_type], row[:container_id]] }
        .each { |row| csv << [row[:old_url], row[:container_type], row[:container_id], row[:container_url]] }
    end
    report_warn "Wrote #{path} (#{broken.size} broken link occurrence(s))"
  end

  # Swaps the input's extension for `.<suffix>`, keeping the parent dir. `/tmp/x.zip`,'template.yml'
  # → `/tmp/x.template.yml`; a directory keeps its name.
  def output_path(input_path, suffix)
    normalized = input_path.chomp('/')
    parent = File.dirname(normalized)
    base = File.basename(normalized, File.extname(normalized))
    File.join(parent, "#{base}.#{suffix}")
  end

  # `<base>.<kind>.log` beside the input, e.g. `participer.arcueil.fr.20260721.import.log`. Strips the
  # export (`.zip`) or template (`.template.yml`/`.yml`) suffix so both tasks share one base name.
  def log_path(input, kind)
    normalized = input.chomp('/')
    base = File.basename(normalized).sub(/\.template\.yml\z/i, '').sub(/\.ya?ml\z/i, '').sub(/\.zip\z/i, '')
    File.join(File.dirname(normalized), "#{base}.#{kind}.log")
  end

  # Tees the task's summary lines (via `report_line`/`report_warn`) to `path` as well as the Rails log, so
  # each run leaves a standalone report next to its artifacts. No-op outside the block.
  def with_report_log(path)
    @report_log = File.open(path, 'w')
    Rails.logger.info "Writing run log to #{path}"
    yield
  ensure
    @report_log&.close
    @report_log = nil
  end

  def report_line(message)
    Rails.logger.info(message)
    @report_log&.puts(message)
  end

  def report_warn(message)
    Rails.logger.warn(message)
    @report_log&.puts(message)
  end
end
