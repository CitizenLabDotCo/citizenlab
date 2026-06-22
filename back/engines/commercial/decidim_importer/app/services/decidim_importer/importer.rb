# frozen_string_literal: true

require 'tmpdir'
require 'net/http'

module DecidimImporter
  # Orchestrates a Decidim → Go Vocal import for the base scaffold (users, folders, projects,
  # phases). Reads the Decidim CSV export (a zip file containing per-model CSVs), builds a
  # tenant-template graph and applies it through the existing template deserializer, then assigns
  # the deferred moderator roles.
  #
  # @example
  #   DecidimImporter::Importer.from_zip('tmp/example.com.zip').import
  class Importer
    # Maps importer model symbol → glob pattern (relative to the export root) for the matching
    # single-file Decidim CSV. Files whose pattern doesn't match anything are silently skipped, so
    # the importer can run on a partial export. Globs are written with `--` separators but `*`
    # absorbs the extra dash in newer exports' `NN---name.csv` triple-dash naming, and `*` matches
    # the empty string so the numeric `NN---` directory prefix is optional too.
    FILE_PATTERNS = {
      organization: '*--organization.csv',
      users: '*--users.csv',
      scopes: '*--scopes.csv',
      folders: '*participatory-processes/*--participatory-process-groups.csv'
    }.freeze

    # Glob (relative to the export root) for each participatory-process directory. Newer exports
    # nest one folder per process under `NN---participatory-processes/`, each holding the process's
    # own CSV and a steps CSV (the steps file has no process column — the directory *is* the
    # association). See {.read_processes}.
    PROCESS_DIR_GLOB = '*participatory-processes/*'
    PROCESS_FILE_GLOB = '*--participatory-process.csv'
    STEPS_FILE_GLOB = '*--steps.csv'
    ATTACHMENTS_FILE_GLOB = '*--attachments.csv'

    # Each process directory holds a `NN---components/` folder with one subdirectory per Decidim
    # component, named `NN---decidim--component--N---<type>` (proposals, meetings, surveys, …). The
    # type is the trailing path segment. Each component dir holds its own `01---component.csv` (the
    # manifest) and, for proposals, `02---proposals.csv` + `03---comments.csv`. Proposals, surveys and
    # pages are consumed (surveys/pages keep their content in the manifest's `specific_data`); other
    # types are recorded for skip-logging but not yet imported.
    COMPONENT_DIR_GLOB = '*components/*'
    COMPONENT_FILE_GLOB = '*--component.csv'
    PROPOSALS_FILE_GLOB = '*--proposals.csv'
    COMMENTS_FILE_GLOB = '*--comments.csv'
    PROPOSALS_COMPONENT = 'proposals'
    SURVEYS_COMPONENT = 'surveys'
    PAGES_COMPONENT = 'pages'

    # Build an importer from a Decidim export zip. Extracts into a tempdir, parses every CSV into
    # memory, then tears the tempdir down.
    def self.from_zip(zip_path, **)
      raise ArgumentError, "file not found: #{zip_path}" unless File.file?(zip_path)

      Dir.mktmpdir('decidim_import_') do |tmp|
        ZipExtractor.extract(zip_path, tmp)
        from_directory(ZipExtractor.detect_csv_root(tmp), **)
      end
    end

    # Build an importer by scanning a directory of already-unzipped Decidim CSVs. The directory
    # should be the one that *directly* contains the export's CSV files
    # (e.g. `…/localhost--20260527144704`).
    def self.from_directory(path, **)
      rows_by_model = FILE_PATTERNS.each_with_object({}) do |(model, pattern), acc|
        file = Dir.glob(File.join(path, pattern)).first
        acc[model] = CsvReader.read(file) if file
      end
      read_processes(path).each { |model, rows| rows_by_model[model] = rows if rows.any? }
      new(rows_by_model, **)
    end

    # Reads every participatory-process directory, aggregating their rows by model: process rows into
    # `:projects`, step rows into `:phases`, attachment rows into `:attachments`, and — from each
    # process's components — proposals into `:proposals`, their comments into `:comments`, and every
    # component manifest into `:components` (the latter drives ideation-phase titles and skip-logging
    # of unconsumed component types).
    #
    # Several of these CSVs carry no foreign-key column — the directory *is* the association — so rows
    # are stamped with their owning process (`decidim_participatory_process`) and, for proposals/
    # comments, their component (`decidim_component`).
    def self.read_processes(root)
      acc = { projects: [], phases: [], attachments: [], proposals: [], comments: [], components: [] }
      process_dirs(root).each do |dir|
        process_file = Dir.glob(File.join(dir, PROCESS_FILE_GLOB)).first
        next unless process_file

        process_rows = CsvReader.read(process_file)
        acc[:projects].concat(process_rows)
        process_uid = process_rows.first&.fetch('uid', nil)
        process_stamp = { 'decidim_participatory_process' => process_uid }

        steps_file = Dir.glob(File.join(dir, STEPS_FILE_GLOB)).first
        acc[:phases].concat(stamp(CsvReader.read(steps_file), process_stamp)) if steps_file

        attachments_file = Dir.glob(File.join(dir, ATTACHMENTS_FILE_GLOB)).first
        acc[:attachments].concat(stamp(CsvReader.read(attachments_file), process_stamp)) if attachments_file

        read_components(dir, process_uid, acc)
      end
      acc
    end

    # Walks a process's component directories, recording each manifest under `:components` and, for
    # proposals components, their proposals and comments (stamped with process + component uid).
    def self.read_components(process_dir, process_uid, acc)
      component_dirs(process_dir).each do |comp_dir|
        comp_file = Dir.glob(File.join(comp_dir, COMPONENT_FILE_GLOB)).first
        comp_row = comp_file && CsvReader.read(comp_file).first
        next unless comp_row

        type = component_type(comp_dir)
        acc[:components] << comp_row.merge('decidim_participatory_process' => process_uid, 'type' => type)
        next unless type == PROPOSALS_COMPONENT

        stamp = { 'decidim_participatory_process' => process_uid, 'decidim_component' => comp_row['uid'] }
        proposals_file = Dir.glob(File.join(comp_dir, PROPOSALS_FILE_GLOB)).first
        acc[:proposals].concat(stamp(CsvReader.read(proposals_file), stamp)) if proposals_file
        comments_file = Dir.glob(File.join(comp_dir, COMMENTS_FILE_GLOB)).first
        acc[:comments].concat(stamp(CsvReader.read(comments_file), stamp)) if comments_file
      end
    end

    def self.stamp(rows, columns)
      rows.map { |row| row.merge(columns) }
    end

    # A process directory is any subdirectory of `*participatory-processes/` that holds a
    # participatory-process CSV (robust to the `NN---decidim--participatory-process--N` naming).
    def self.process_dirs(root)
      Dir.glob(File.join(root, PROCESS_DIR_GLOB)).select do |path|
        File.directory?(path) && Dir.glob(File.join(path, PROCESS_FILE_GLOB)).any?
      end
    end

    def self.component_dirs(process_dir)
      Dir.glob(File.join(process_dir, COMPONENT_DIR_GLOB)).select { |path| File.directory?(path) }
    end

    # The component type is the trailing `---<type>` segment of the directory name, e.g.
    # `01---decidim--component--21---proposals` → `proposals`.
    def self.component_type(comp_dir)
      File.basename(comp_dir).split('---').last
    end

    # Applies a previously dumped tenant-template YAML file to the current tenant, independent of
    # the CSV/zip pipeline (the file is the only input). Returns the deserializer's created-ids
    # hash. Note: scoped moderator roles (`RoleAssigner`) are *not* applied here — that pass needs
    # the in-memory ref map, so it only runs in the combined {#import} path. Real exports don't
    # carry process-roles yet, so a file-based import is currently complete.
    #
    # @param import_images [Boolean] when false, `remote_*_url` attributes are stripped before
    #   deserialize (no external HTTP), e.g. for exports whose image URLs are unreachable.
    def self.apply_template_file(path, import_images: true)
      template = YAML.load_file(path, aliases: true)
      IdeaStatuses.resolve!(template)
      resolve_area_orderings!(template)
      prepare_images!(template, import_images: import_images)
      prune_fileless_attachments!(template)
      created = MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
      reconcile_permissions!
      created
    end

    # Offsets each imported area's `ordering` past the tenant's existing areas. `Area#ordering` is
    # uniquely indexed and the deserializer doesn't reposition (`acts_as_list_no_update`), so without
    # this an import into a tenant that already has areas — or a re-import into the same tenant — would
    # abort on a unique-ordering collision. Relative order is preserved. Run inside the target tenant.
    def self.resolve_area_orderings!(template)
      areas = template.dig('models', 'area')
      return template if areas.blank?

      base = (::Area.maximum(:ordering) || -1) + 1
      areas.each { |attrs| attrs['ordering'] = base + attrs['ordering'] if attrs['ordering'] }
      template
    end

    # The deserializer creates phases/projects directly, bypassing the SideFx that normally generates
    # their `Permission` records — so imported phases would have none (e.g. `posting_idea`), and a
    # native-survey phase's `posting_permission` would be nil, 500ing the admin endpoints. Reconciling
    # all permissions (idempotent) backfills the missing ones.
    def self.reconcile_permissions!
      Permissions::PermissionsUpdateService.new.update_all_permissions
    end

    # Applies an AppConfiguration patch JSON (the companion artifact `dump_yaml` writes) to the
    # current tenant: deep-merges its `settings` over the tenant's, and — when image fetching is on —
    # sets its remote logo/favicon URLs. No-op returning false when `path` is nil or missing; returns
    # true when applied. Apply this *before* the template so locale settings are in place for the
    # records that use them.
    def self.apply_app_config_file(path, import_images: true)
      return false unless path && File.file?(path)

      apply_app_config(JSON.parse(File.read(path)), import_images: import_images)
      true
    end

    def self.apply_app_config(patch, import_images: true)
      config = AppConfiguration.instance
      settings = patch['settings']
      if settings.is_a?(Hash)
        # `deep_merge` overwrites array values, so the patch's `core.locales` *replaces* the tenant's
        # rather than unioning with it — the imported content's locales become the tenant's exact set.
        # Any existing user still on a now-removed locale is migrated to the first of the new locales,
        # otherwise `AppConfiguration#validate_locales` would reject dropping a locale still in use.
        migrate_users_to_first_locale(settings.dig('core', 'locales'))
        config.settings = config.settings.deep_merge(settings)
      end

      if import_images
        patch.slice('remote_logo_url', 'remote_favicon_url').each do |attr, value|
          setter = :"#{attr}="
          config.public_send(setter, value) if config.respond_to?(setter)
        end
      end
      config.save!
      config
    end

    # Moves every user whose locale isn't among the incoming `locales` onto the first of them, so the
    # subsequent `core.locales` replacement doesn't strand a user on a removed locale. No-op for a
    # blank locale list. Bulk `update_all` (no callbacks) — a locale switch needs none.
    def self.migrate_users_to_first_locale(locales)
      return if locales.blank?

      User.where.not(locale: locales).update_all(locale: locales.first)
    end

    # Prepares the loaded template's images before deserialize.
    #
    # With fetching **off**, every image is dropped — `remote_*_url` attachment attributes and the
    # `<img>` tags embedded in rich-text bodies — so the deserializer performs no HTTP.
    #
    # With fetching **on**, images that are still reachable are kept and only the unreachable ones are
    # dropped — both `remote_*_url` attachments (avatars, hero images) and the `<img>` tags embedded in
    # rich-text bodies. Decidim references the source platform's storage, where a since-deleted image
    # 404s on download and would abort the all-or-nothing import; probing each URL once (shared cache)
    # and dropping only the dead ones keeps the import robust without losing images that are still
    # there.
    def self.prepare_images!(template, import_images:)
      if import_images
        reachability = {}
        prune_unreachable_remote_urls!(template, reachability)
        prune_unreachable_embedded_images!(template, reachability)
      else
        strip_remote_image_urls!(template)
        strip_embedded_images!(template)
      end
    end

    # Drops any `project_file` whose file URL was pruned (unreachable) or stripped (images off): a
    # ProjectFile with no file is a broken, empty attachment, so the record is removed rather than
    # imported. Runs after {.prepare_images!}, which is what removes the unreachable/stripped URLs.
    def self.prune_fileless_attachments!(template)
      files = template.dig('models', 'project_file')
      return unless files

      files.reject! { |attrs| attrs['remote_file_url'].blank? && attrs['file'].blank? }
    end

    # Drops every `remote_*_url` attribute so the deserializer doesn't trigger a CarrierWave fetch.
    def self.strip_remote_image_urls!(template)
      template['models'].each_value do |records|
        records.each { |attrs| attrs.delete_if { |key, _| remote_image_url?(key) } }
      end
    end

    # Removes every `<img>` tag embedded in a rich-text `*_multiloc` value (text kept, images dropped).
    def self.strip_embedded_images!(template)
      rewrite_multiloc_html!(template) { |html| html.gsub(/<img\b[^>]*>/i, '') }
    end

    # Drops each `remote_*_url` attachment attribute whose URL can't be reached, leaving the reachable
    # ones for CarrierWave to fetch.
    def self.prune_unreachable_remote_urls!(template, reachability = {})
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.reject! do |key, value|
            next false unless remote_image_url?(key) && value.is_a?(String)

            reachability[value] = image_reachable?(value) unless reachability.key?(value)
            !reachability[value]
          end
        end
      end
    end

    def self.remote_image_url?(key)
      key.is_a?(String) && key.start_with?('remote_') && key.end_with?('_url')
    end

    # Drops only the embedded `<img>` tags whose remote source can't be reached, keeping the rest.
    # Each distinct URL is probed once (cache shared with the attachment pass).
    def self.prune_unreachable_embedded_images!(template, reachability = {})
      rewrite_multiloc_html!(template) do |html|
        html.gsub(/<img\b[^>]*>/i) do |tag|
          src = tag[%r{\bsrc\s*=\s*["']?(https?://[^"' >]+)}i, 1]
          next tag if src.nil? # base64 / relative sources are left untouched

          reachability[src] = image_reachable?(src) unless reachability.key?(src)
          reachability[src] ? tag : ''
        end
      end
    end

    # True only when the URL resolves to a 2xx (following redirects); any non-success or error → false,
    # so a missing image is dropped rather than risking a download failure mid-import. Uses HEAD so the
    # image body isn't pulled.
    def self.image_reachable?(url, redirects_left = 5)
      uri = URI.parse(url)
      return false unless uri.is_a?(URI::HTTP)

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https',
        open_timeout: 5, read_timeout: 5) { |http| http.head(uri.request_uri) }
      case response
      when Net::HTTPSuccess then true
      when Net::HTTPRedirection
        redirects_left.positive? && image_reachable?(URI.join(url, response['location']).to_s, redirects_left - 1)
      else false
      end
    rescue StandardError
      false
    end

    # Rewrites every rich-text `*_multiloc` HTML string in the template through the given block.
    def self.rewrite_multiloc_html!(template)
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.each do |key, value|
            next unless key.is_a?(String) && key.end_with?('_multiloc') && value.is_a?(Hash)

            value.transform_values! { |html| html.is_a?(String) ? yield(html) : html }
          end
        end
      end
    end

    # @param rows_by_model [Hash{Symbol=>Array<Hash>}] parsed CSV rows keyed by model
    #   (:users, :folders, :projects, :phases, :process_roles). Missing keys are treated as
    #   "model not in this export" and silently skipped.
    # @param import_images [Boolean] when false, `remote_*_url` attributes are dropped from the
    #   template before deserialize, so no external HTTP is performed. Useful for dry runs and for
    #   exports whose image URLs reference an unreachable host (e.g. the Decidim dev instance's
    #   `http://localhost/rails/active_storage/...` blob redirects).
    # @param anonymize_users [Boolean] when true, imported users' names and emails are replaced with
    #   fake values (for non-production dumps that shouldn't carry real PII).
    def initialize(rows_by_model, primary_locale: 'fr-FR', locale_mapping: {}, import_images: true,
      anonymize_users: false)
      @rows_by_model = rows_by_model
      @primary_locale = primary_locale
      @locale_mapper = LocaleMapper.new(locale_mapping, fallback_locale: primary_locale)
      @ref_map = RefMap.new
      @import_images = import_images
      @anonymize_users = anonymize_users
    end

    attr_reader :ref_map

    # Builds the {TemplateBuilder} for the configured exports without applying anything. Extractors
    # must run folders → projects → phases so cross-record refs resolve; users are independent.
    def build_template
      user_custom_fields.register!(ref_map)
      run_users_extractor
      run_extractor(Extractors::ScopesExtractor, :scopes)
      run_extractor(Extractors::FoldersExtractor, :folders)
      run_extractor(Extractors::ProjectsExtractor, :projects)
      run_phases
      run_proposals
      run_comments
      run_surveys
      run_static_pages
      run_files
      TemplateBuilder.new(ref_map)
    end

    # The AppConfiguration patch derived from `01--organization.csv` — a JSON-able hash of just the
    # fields with a Go Vocal equivalent, for merging into the target tenant's app config on import.
    # The template pipeline itself doesn't touch app config, so this is a separate artifact.
    # Returns `{}` when the export has no organization file.
    def app_config_patch
      AppConfigMapper.new(organization_row, locale_mapper: @locale_mapper, primary_locale: @primary_locale).patch
    end

    # The YAML artifact (the product output) for the configured exports.
    delegate :to_yaml, to: :build_template

    # Applies the import to the current tenant. Returns the deserializer's created-ids hash.
    def import(validate: true)
      builder = build_template
      # Round-trip through YAML so we exercise the actual artifact the deserializer consumes.
      template = YAML.load(builder.to_yaml, aliases: true)
      IdeaStatuses.resolve!(template)
      self.class.resolve_area_orderings!(template)
      self.class.prepare_images!(template, import_images: @import_images)
      self.class.prune_fileless_attachments!(template)
      created_object_ids = MultiTenancy::Templates::TenantDeserializer.new.deserialize(template, validate: validate)
      RoleAssigner.new(ref_map).assign(created_object_ids, role_assignments)
      self.class.reconcile_permissions!
      created_object_ids
    end

    # Steps that couldn't be imported (e.g. missing dates), for surfacing back to the client.
    def skipped_phases
      @phases_extractor&.skipped || []
    end

    # Proposals components that couldn't be placed as a phase (e.g. no datable proposals).
    def skipped_components
      @phase_projector&.skipped || []
    end

    # Proposals/comments that couldn't be imported (e.g. their phase or proposal wasn't created).
    def skipped_participation
      (@proposals_extractor&.skipped || []) + (@comments_extractor&.skipped || [])
    end

    # Surveys/questions that couldn't be imported (e.g. an unsupported question type).
    def skipped_surveys
      @surveys_extractor&.skipped || []
    end

    # Pages that couldn't be imported as static pages (e.g. unpublished drafts, no owning project).
    def skipped_pages
      @static_pages_extractor&.skipped || []
    end

    # Attachments that couldn't be imported as project files (e.g. no file URL, no owning project).
    def skipped_files
      @files_extractor&.skipped || []
    end

    private

    def run_phases
      if @rows_by_model.key?(:phases)
        @phases_extractor = Extractors::PhasesExtractor.new(
          rows_for(:phases), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
        )
        @phases_extractor.run
      end
      @phase_projector = PhaseProjector.new(ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale)
      @phase_projector.run(step_rows: rows_for(:phases), participation_components: participation_components)
    end

    def run_proposals
      return unless @rows_by_model.key?(:proposals)

      @proposals_extractor = Extractors::ProposalsExtractor.new(
        rows_for(:proposals), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @proposals_extractor.run
    end

    def run_comments
      return unless @rows_by_model.key?(:comments)

      @comments_extractor = Extractors::CommentsExtractor.new(
        rows_for(:comments), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @comments_extractor.run
    end

    def run_surveys
      return if survey_component_rows.empty?

      @surveys_extractor = Extractors::SurveysExtractor.new(
        survey_component_rows, ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @surveys_extractor.run
    end

    # Decidim process attachments → project-level file attachments (`ProjectFile`). Runs after the
    # projects extractor so each file's `project_ref` resolves through the ref map.
    def run_files
      return unless @rows_by_model.key?(:attachments)

      @files_extractor = Extractors::FilesExtractor.new(
        rows_for(:attachments), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @files_extractor.run
    end

    # Decidim `pages` components → project-level static pages (not phases). Runs after the projects
    # extractor so each page's `project_ref` resolves through the ref map.
    def run_static_pages
      return if page_component_rows.empty?

      @static_pages_extractor = Extractors::StaticPagesExtractor.new(
        page_component_rows, ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @static_pages_extractor.run
    end

    # The phase-generating components fed to {PhaseProjector}: proposals → ideation phases (dated by
    # their proposals' published_at) and surveys → native_survey phases (dated by the component's
    # publication date — the export carries no responses to date them by). Pages are *not* here: they
    # become project-level static pages via {Extractors::StaticPagesExtractor}.
    def participation_components
      proposal_components + survey_phase_components
    end

    def proposal_components
      names = component_name_map
      rows_for(:proposals)
        .group_by { |row| [row['decidim_participatory_process'], row['decidim_component']] }
        .map do |(process_uid, component_uid), proposal_rows|
          { process_uid: process_uid, component_uid: component_uid, name: names[component_uid],
            method: 'ideation', dates: proposal_rows.pluck('published_at') }
        end
    end

    def survey_phase_components
      survey_component_rows.map do |row|
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: SurveyParser.title(row['specific_data']) || row['name'],
          method: 'native_survey', dates: [row['published_at']] }
      end
    end

    # Component manifest rows whose type is `surveys` (their questionnaire lives in `specific_data`).
    def survey_component_rows
      @survey_component_rows ||= rows_for(:components).select { |row| row['type'] == SURVEYS_COMPONENT }
    end

    # Component manifest rows whose type is `pages` (their body lives in `specific_data`).
    def page_component_rows
      @page_component_rows ||= rows_for(:components).select { |row| row['type'] == PAGES_COMPONENT }
    end

    def component_name_map
      rows_for(:components).each_with_object({}) { |row, acc| acc[row['uid']] = row['name'] }
    end

    # Custom user fields are seeded from the organization's `extra_user_fields` config (if present)
    # and feed both the template (new `custom_field` records) and the users extractor (which keys to
    # copy off `extended_data`).
    def user_custom_fields
      @user_custom_fields ||= UserCustomFields.new(
        organization_row, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
    end

    def run_users_extractor
      return unless @rows_by_model.key?(:users)

      Extractors::UsersExtractor.new(
        rows_for(:users), ref_map,
        locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        extra_text_field_keys: user_custom_fields.text_field_keys,
        anonymize_users: @anonymize_users
      ).run
    end

    def organization_row
      rows_for(:organization).first
    end

    def run_extractor(klass, model)
      return unless @rows_by_model.key?(model)

      klass.new(rows_for(model), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale).run
    end

    def role_assignments
      return [] unless @rows_by_model.key?(:process_roles)

      Extractors::ProcessRolesExtractor.new(
        rows_for(:process_roles), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      ).run
    end

    def rows_for(model)
      @rows_by_model[model] || []
    end
  end
end
