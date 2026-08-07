# frozen_string_literal: true

require 'csv'
require 'tmpdir'

# Workflow: `create_template` reads a Decidim export (zip or dir) and writes the loose artifacts
# (`.template.yml` + `.app_config.json` + `.url_mapping.csv` + `.moderators.csv`), then bundles them into
# a single `<base>.template.zip` — it never touches a tenant. `import` takes that bundle, unpacks it and
# applies the template to the tenant matching `host`, first applying the `.app_config.json` patch (union
# in the export's locales + turn on the import's feature flags). `verify` dry-runs a template on a
# throwaway tenant. `create_template`/`import` each tee their summary to a run log beside the artifacts:
# `<base>.create.log` / `<base>.import.log`.
#
#   rake decidim_importer:create_template[tmp/import_files/example.com.zip,fr-FR]
#   rake decidim_importer:create_template[tmp/import_files/example.com.zip,fr-FR,false,true]  # include_source_url
#   rake decidim_importer:import[tmp/import_files/example.com.template.zip,localhost]
#   rake decidim_importer:import[tmp/import_files/example.com.template.zip,localhost,false]  # skip image fetches
#   rake decidim_importer:verify[tmp/import_files/example.com.template.yml,fr-FR,en]
#
# `import` refuses to run unless the `decidim_importer` feature is enabled for the target host (a
# per-tenant safety gate, off by default — enable it in admin HQ). `import` deserializes the template,
# then finishes by rewriting embedded Decidim links via the `.url_mapping.csv` (unresolved ones →
# `<base>.broken_links.csv`) and building the Consultations/Assemblies folder structure. The 3rd arg
# disables image fetching (for templates whose `remote_*_url`s point at an unreachable host).
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
      creator.skipped_proposal_votes.each { |s| report_warn "  skipped proposal vote #{s[:uid]}: #{s[:reason]}" }
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
      # Evaluates the moderator assignments (and so populates `skipped_roles`), hence logged after.
      write_moderators_csv(creator, path)
      creator.skipped_roles.each { |s| report_warn "  skipped role #{s[:uid]}: #{s[:reason]}" }
      write_template_zip(path)
    end
  end

  desc 'Imports a `<base>.template.zip` bundle (from `create_template`) into the tenant matching `host`: ' \
       'applies the app-config patch (union in the export\'s locales + enable the import\'s feature ' \
       'flags), deserializes the template, then runs the post-import finishing (link correction + ' \
       'Consultations/Assemblies folder structure + project-moderator roles).'
  task :import, %i[file host import_uploads] => [:environment] do |_t, args|
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    zip = args.fetch(:file)
    import_uploads = args[:import_uploads].to_s.downcase != 'false'

    abort "Expected a `<base>.template.zip` bundle (from create_template), got: #{zip}" \
      unless zip.downcase.end_with?('.zip')
    ensure_import_enabled!(tenant)

    # Logs and the broken-links report land beside the zip; the artifacts themselves are read from a
    # tempdir the bundle is unpacked into.
    with_report_log(log_path(zip, 'import')) do
      report_line "Decidim import → tenant=#{tenant.host} file=#{zip} import_uploads=#{import_uploads}"
      broken = []
      Dir.mktmpdir('decidim_import_') do |tmp|
        DecidimImporter::ZipExtractor.extract(zip, tmp)
        file = Dir.glob(File.join(tmp, '*.template.yml')).first
        raise "no .template.yml found in #{zip}" unless file

        tenant.switch do
          # Apply the import's app-config patch: union in the export's locales (so deserialize doesn't
          # fail on a missing locale) and turn on the feature flags the imported projects/pages need.
          added = DecidimImporter::Importer.apply_import_app_config_file(app_config_sibling(file))
          report_line "  added locales #{added.join(', ')}" if added.any?

          created = DecidimImporter::Importer.apply_template_file(file, import_uploads: import_uploads)
          created.each { |klass, ids| report_line "  created #{ids.size} #{klass}" }

          broken = finalize_import!(file)
        end
      end
      write_broken_links_csv("#{artifact_base(zip)}.broken_links.csv", broken)
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

    assign_moderators!(file)
    broken
  end

  # Post-import (in the tenant): grant the project-moderator roles from the sibling `<base>.moderators.csv`
  # (user `unique_code` + project `slug`). The deserializer can't carry them (a `project_id` inside the
  # user's JSONB `roles`), so they're applied here by natural-key lookup. No-op when the CSV is absent.
  def assign_moderators!(file)
    path = moderators_path(file)
    unless File.exist?(path)
      report_line "  no moderators CSV at #{path} → skipping moderator roles"
      return
    end

    assignments = CSV.read(path, headers: true).map(&:to_h)
    applied = DecidimImporter::ModeratorAssigner.new.assign(assignments)
    report_line "  assigned #{applied} project-moderator role(s)"
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

  # Writes the app-config patch (the export's locales + the import's feature flags) as
  # `<base>.app_config.json`, which `import` applies before deserializing.
  def write_app_config_json(creator, input_path)
    json_path = output_path(input_path, 'app_config.json')
    File.write(json_path, JSON.pretty_generate(creator.app_config_patch))
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

  # Writes the project-moderator assignments as `<base>.moderators.csv` (skipped when there are none),
  # applied to the tenant during `import`'s finishing by {DecidimImporter::ModeratorAssigner}.
  def write_moderators_csv(creator, input_path)
    assignments = creator.moderator_assignments
    if assignments.empty?
      report_line '  no project-moderator roles → skipping moderators CSV'
      return
    end

    csv_path = output_path(input_path, 'moderators.csv')
    CSV.open(csv_path, 'w') do |csv|
      csv << %w[user_unique_code project_slug]
      assignments.each { |a| csv << [a['user_unique_code'], a['project_slug']] }
    end
    report_line "Wrote #{csv_path} (#{assignments.size} moderator role(s))"
  end

  # `<base>.moderators.csv` beside the template (its `.template.yml`/`.yml` suffix swapped).
  def moderators_path(file)
    candidate = file.sub(/\.template\.yml\z/i, '.moderators.csv')
    candidate == file ? file.sub(/\.ya?ml\z/i, '.moderators.csv') : candidate
  end

  # Bundles the artifacts `create_template` just wrote into a single `<base>.template.zip` — the one file
  # `import` consumes (unpacking it to a tempdir first). Includes whichever of the expected artifacts were
  # actually produced (the app-config/link/moderator ones are skipped when empty). The `.create.log` is
  # still being written, so it's left beside the zip rather than bundled.
  def write_template_zip(input_path)
    # Derive members via `output_path` — the same function that wrote them — so the shared base always
    # matches, and the bundle unpacks back to the exact filenames the sibling lookups expect.
    members = %w[template.yml app_config.json url_mapping.csv moderators.csv]
      .map { |suffix| output_path(input_path, suffix) }.select { |member| File.exist?(member) }
    zip_path = output_path(input_path, 'template.zip')
    DecidimImporter::ZipExtractor.compress(members, zip_path)
    report_line "Wrote #{zip_path} (#{members.size} file(s))"
  end

  # Writes the unresolved links to `path` (no-op when there are none).
  def write_broken_links_csv(path, broken)
    if broken.empty?
      report_line '  no broken links'
      return
    end

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

  # `<base>.<kind>.log` beside the input, e.g. `participer.arcueil.fr.20260721.import.log` — every task
  # shares one base name whatever it was handed (export zip/dir, `.template.zip` bundle, or template YAML).
  def log_path(input, kind)
    "#{artifact_base(input)}.#{kind}.log"
  end

  # The shared base path (parent dir + base name, suffix stripped) an import bundle and its loose
  # artifacts hang off: `<dir>/<base>.template.zip` and `<dir>/<base>.broken_links.csv` both reduce to
  # `<dir>/<base>`. Handles a source export (`.zip`/dir), the bundle (`.template.zip`) and a template YAML.
  def artifact_base(path)
    normalized = path.chomp('/')
    base = File.basename(normalized)
      .sub(/\.template\.zip\z/i, '')
      .sub(/\.template\.ya?ml\z/i, '')
      .sub(/\.ya?ml\z/i, '')
      .sub(/\.zip\z/i, '')
    File.join(File.dirname(normalized), base)
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
