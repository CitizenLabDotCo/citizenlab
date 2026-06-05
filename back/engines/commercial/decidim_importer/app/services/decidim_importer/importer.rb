# frozen_string_literal: true

require 'tmpdir'

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
      folders: '*participatory-processes/*--participatory-process-groups.csv'
    }.freeze

    # Glob (relative to the export root) for each participatory-process directory. Newer exports
    # nest one folder per process under `NN---participatory-processes/`, each holding the process's
    # own CSV and a steps CSV (the steps file has no process column — the directory *is* the
    # association). See {.read_processes}.
    PROCESS_DIR_GLOB = '*participatory-processes/*'
    PROCESS_FILE_GLOB = '*--participatory-process.csv'
    STEPS_FILE_GLOB = '*--steps.csv'

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

    # Reads every participatory-process directory, aggregating their process rows into `:projects`
    # and their step rows into `:phases`. Because the steps CSV carries no process column, each step
    # row is stamped with its process `uid` (under the key the {Extractors::PhasesExtractor}
    # expects) so phases can be linked back to their project.
    def self.read_processes(root)
      projects = []
      phases = []
      process_dirs(root).each do |dir|
        process_file = Dir.glob(File.join(dir, PROCESS_FILE_GLOB)).first
        next unless process_file

        process_rows = CsvReader.read(process_file)
        projects.concat(process_rows)
        process_uid = process_rows.first&.fetch('uid', nil)

        steps_file = Dir.glob(File.join(dir, STEPS_FILE_GLOB)).first
        next unless steps_file

        phases.concat(CsvReader.read(steps_file).map { |step| step.merge('decidim_participatory_process' => process_uid) })
      end
      { projects: projects, phases: phases }
    end

    # A process directory is any subdirectory of `*participatory-processes/` that holds a
    # participatory-process CSV (robust to the `NN---decidim--participatory-process--N` naming).
    def self.process_dirs(root)
      Dir.glob(File.join(root, PROCESS_DIR_GLOB)).select do |path|
        File.directory?(path) && Dir.glob(File.join(path, PROCESS_FILE_GLOB)).any?
      end
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
      strip_remote_image_urls!(template) unless import_images
      MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
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
        merged = config.settings.deep_merge(settings)
        if (incoming_locales = settings.dig('core', 'locales'))
          # Union, not replace: the tenant must keep supporting every locale its existing users
          # already use while gaining the imported content's locales (deep_merge would overwrite the
          # array, dropping locales and failing AppConfiguration's `validate_locales`).
          merged['core']['locales'] = (config.settings('core', 'locales') || []) | incoming_locales
        end
        config.settings = merged
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

    # Drops every `remote_*_url` attribute so the deserializer doesn't trigger a CarrierWave fetch.
    def self.strip_remote_image_urls!(template)
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.delete_if { |k, _| k.is_a?(String) && k.start_with?('remote_') && k.end_with?('_url') }
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
    def initialize(rows_by_model, primary_locale: 'fr-FR', locale_mapping: {}, import_images: true)
      @rows_by_model = rows_by_model
      @primary_locale = primary_locale
      @locale_mapper = LocaleMapper.new(locale_mapping, fallback_locale: primary_locale)
      @ref_map = RefMap.new
      @import_images = import_images
    end

    attr_reader :ref_map

    # Builds the {TemplateBuilder} for the configured exports without applying anything. Extractors
    # must run folders → projects → phases so cross-record refs resolve; users are independent.
    def build_template
      user_custom_fields.register!(ref_map)
      run_users_extractor
      run_extractor(Extractors::FoldersExtractor, :folders)
      run_extractor(Extractors::ProjectsExtractor, :projects)
      if @rows_by_model.key?(:phases)
        @phases_extractor = Extractors::PhasesExtractor.new(
          rows_for(:phases), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
        )
        @phases_extractor.run
      end
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
      self.class.strip_remote_image_urls!(template) unless @import_images
      created_object_ids = MultiTenancy::Templates::TenantDeserializer.new.deserialize(template, validate: validate)
      RoleAssigner.new(ref_map).assign(created_object_ids, role_assignments)
      created_object_ids
    end

    # Steps that couldn't be imported (e.g. missing dates), for surfacing back to the client.
    def skipped_phases
      @phases_extractor&.skipped || []
    end

    private

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
        extra_text_field_keys: user_custom_fields.text_field_keys
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
