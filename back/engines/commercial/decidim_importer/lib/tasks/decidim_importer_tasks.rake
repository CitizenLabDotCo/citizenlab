# frozen_string_literal: true

require 'csv'

# Two-step workflow — dump, then import the dumped file:
#   rake decidim_importer:dump_yaml[tmp/import_files/example.com.zip,fr-FR]
#     → writes tmp/import_files/example.com.template.yml + .app_config.json + .url_mapping.csv
#   rake decidim_importer:dump_yaml[tmp/import_files/example.com.zip,fr-FR,false,true]  # include_source_url
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost]
#   rake decidim_importer:import[tmp/import_files/example.com.template.yml,localhost,false]  # skip image fetches
#   rake decidim_importer:finalize[tmp/import_files/example.com.template.yml,localhost]  # run last
#
# `finalize` runs *after* `import` and does two things that need the applied tenant (real ids):
#   1. reads the `.url_mapping.csv` dumped alongside the template (old Decidim URL → new target) and
#      rewrites the links embedded in the tenant's Content Builder layouts and static pages — file
#      links resolve to the imported file's real content URL. Links that should be repointed but
#      couldn't be resolved are written to `<base>.broken_links.csv` for manual review.
#   2. gathers every top-level (ungrouped) project into a new "Consultations" folder, gives that folder
#      a Content Builder layout with a `Selection` widget listing those projects plus the group folders,
#      and adds the folder to the nav bar (the widget references admin-publication ids that only exist
#      once the template is applied).
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
  task :dump_yaml, %i[path primary_locale production include_source_url] => [:environment] do |_t, args|
    path = args.fetch(:path)
    # Default to anonymising user names + emails; pass `production=true` to keep the real values.
    production = args[:production].to_s.strip.downcase == 'true'
    # Pass `include_source_url=true` to prepend a link back to each project's original Decidim URL.
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
    importer.skipped_files.each { |s| Rails.logger.warn "  skipped file #{s[:uid]}: #{s[:reason]}" }
    write_app_config_json(importer, path)
    write_url_mapping_csv(importer, path)
  end

  desc 'Post-import finishing (run after `import`): corrects Decidim links, then gathers ungrouped ' \
       'projects into a "Consultations" folder (+ layout and nav bar).'
  task :finalize, %i[mapping host] => [:environment] do |_t, args|
    mapping_path = url_mapping_path(args.fetch(:mapping))
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    map = DecidimImporter::LinkMap.read_csv(mapping_path)

    Rails.logger.info "Decidim finalize → tenant=#{tenant.host} mapping=#{mapping_path}"
    broken = []
    updated = 0
    tenant.switch do
      # 1. Rewrite Decidim back-links in Content Builder layouts and static pages. A file link resolves
      #    to the imported file's real content URL (memoised per id).
      file_urls = Hash.new { |cache, id| cache[id] = Files::File.find_by(id: id)&.content&.url }
      resolver = ->(file_id) { file_urls[file_id] }

      ContentBuilder::Layout.find_each do |layout|
        changed, found = correct_layout_links(layout, map, resolver)
        if changed
          layout.save!
          updated += 1
        end
        found.each { |url| broken << broken_link_row(url, layout.content_buildable_type, layout.content_buildable_id) }
      end
      StaticPage.find_each do |page|
        changed, found = correct_static_page_links(page, map, resolver)
        if changed
          page.save!
          updated += 1
        end
        found.each { |url| broken << broken_link_row(url, 'StaticPage', page.id) }
      end
      Rails.logger.info "  rewrote links in #{updated} record(s)"

      # 2. Gather ungrouped projects into the "Consultations" folder (+ its Selection layout and nav bar).
      consultations = DecidimImporter::ConsultationsFolder.new.run
      Rails.logger.info "  Consultations folder #{consultations[:folder].slug}: " \
                        "moved #{consultations[:moved_projects].size} project(s) in"
    end
    write_broken_links_csv(mapping_path, broken)
    Rails.logger.info 'COMPLETE'
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
  task :verify, %i[file locales import_images] => [:environment] do |_t, args|
    file = args.fetch(:file)
    locales = (args[:locales] || 'fr-FR,en').split(/[,\s]+/).compact_blank.uniq
    # Images are skipped by default (verification is about structure); pass import_images=true to also
    # exercise the image-fetching path (reachable images are downloaded, unreachable ones pruned).
    import_images = args[:import_images].to_s.strip.downcase == 'true'

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
        created = DecidimImporter::Importer.apply_template_file(file, import_images: import_images)
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

  # Logs how many of each model the built template will create — the overall total, then the same
  # broken down per project (the project's title as a header), then a final shared bucket for records
  # not tied to a project (users, areas, scopes, folders).
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

  # Writes the old→new link mapping next to the input as `<base>.url_mapping.csv` (unless there are no
  # correctable links). Applied to the tenant after import by `finalize`.
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

  # The URL-mapping CSV for a `finalize` argument: the path itself when a `.csv` is given, else the
  # template path with its `.template.yml` (or plain `.yml`) suffix swapped for `.url_mapping.csv`.
  def url_mapping_path(arg)
    return arg if arg.downcase.end_with?('.csv')

    candidate = arg.sub(/\.template\.yml\z/i, '.url_mapping.csv')
    candidate == arg ? arg.sub(/\.ya?ml\z/i, '.url_mapping.csv') : candidate
  end

  # Applies the mapping to one layout's `TextMultiloc` text fields. Returns `[changed?, broken_urls]`.
  # Reassigns `craftjs_json` (a deep dup) only when something changed, so ActiveRecord sees it dirty.
  def correct_layout_links(layout, map, resolver)
    craftjs = layout.craftjs_json
    return [false, []] unless craftjs.is_a?(Hash)

    craftjs = craftjs.deep_dup
    changed = false
    broken = []
    craftjs.each_value do |node|
      # ROOT's `type` is the plain string 'div', so guard before treating it as a component hash.
      next unless node.is_a?(Hash) && node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'TextMultiloc'

      text = node.dig('props', 'text')
      next unless text.is_a?(Hash)

      changed |= correct_multiloc!(text, map, resolver, broken)
    end
    layout.craftjs_json = craftjs if changed
    [changed, broken.uniq]
  end

  # Applies the mapping to a static page's top info section. Returns `[changed?, broken_urls]`.
  def correct_static_page_links(page, map, resolver)
    body = page.top_info_section_multiloc
    return [false, []] unless body.is_a?(Hash)

    body = body.deep_dup
    broken = []
    changed = correct_multiloc!(body, map, resolver, broken)
    page.top_info_section_multiloc = body if changed
    [changed, broken.uniq]
  end

  # Rewrites each locale's HTML of a `{ locale => html }` multiloc in place, appending any broken URLs
  # to `broken`. Returns whether anything changed.
  def correct_multiloc!(multiloc, map, resolver, broken)
    changed = false
    multiloc.each do |locale, html|
      new_html, found = map.apply(html, file_resolver: resolver)
      broken.concat(found)
      next if new_html == html

      multiloc[locale] = new_html
      changed = true
    end
    changed
  end

  def broken_link_row(url, container_type, container_id)
    { old_url: url, container_type: container_type, container_id: container_id }
  end

  # Writes the unresolved ("broken") links beside the mapping as `<base>.broken_links.csv`; no-op when
  # there are none.
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
