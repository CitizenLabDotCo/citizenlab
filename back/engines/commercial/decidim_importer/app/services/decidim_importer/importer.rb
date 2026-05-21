# frozen_string_literal: true

module DecidimImporter
  # Orchestrates a Decidim → Go Vocal import for the base scaffold (users, folders, projects,
  # phases). Reads the per-model XLSX exports, builds a tenant-template graph and applies it through
  # the existing template deserializer, then assigns the deferred moderator roles.
  #
  # @example
  #   DecidimImporter::Importer.from_files(
  #     users: 'tmp/users.xlsx',
  #     folders: 'tmp/process_groups.xlsx',
  #     projects: 'tmp/processes.xlsx',
  #     phases: 'tmp/steps.xlsx',
  #     process_roles: 'tmp/process_user_roles.xlsx'
  #   ).import
  class Importer
    # The XLSX models the base-scaffold iteration understands.
    MODELS = %i[users folders projects phases process_roles].freeze

    # Build an importer straight from xlsx file paths (or IO/buffers).
    def self.from_files(files, **)
      xlsx_service = XlsxService.new
      rows_by_model = files.to_h do |model, source|
        buffer = source.respond_to?(:read) ? source.read : File.binread(source)
        [model, xlsx_service.xlsx_to_hash_array(buffer)]
      end
      new(rows_by_model, **)
    end

    # @param rows_by_model [Hash{Symbol=>Array<Hash>}] parsed rows keyed by model
    #   (:users, :folders, :projects, :phases, :process_roles).
    def initialize(rows_by_model, primary_locale: 'fr-FR', locale_mapping: {})
      @rows_by_model = rows_by_model
      @primary_locale = primary_locale
      @locale_mapper = LocaleMapper.new(locale_mapping, fallback_locale: primary_locale)
      @ref_map = RefMap.new
    end

    attr_reader :ref_map

    # Builds the {TemplateBuilder} for the configured exports without applying anything. Extractors
    # must run folders → projects → phases so cross-record refs resolve; users are independent.
    def build_template
      run_extractor(Extractors::UsersExtractor, :users)
      run_extractor(Extractors::FoldersExtractor, :folders)
      run_extractor(Extractors::ProjectsExtractor, :projects)
      @phases_extractor = Extractors::PhasesExtractor.new(
        rows_for(:phases), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @phases_extractor.run
      TemplateBuilder.new(ref_map)
    end

    # The YAML artifact (the product output) for the configured exports.
    delegate :to_yaml, to: :build_template

    # Applies the import to the current tenant. Returns the deserializer's created-ids hash.
    def import(validate: true)
      builder = build_template
      # Round-trip through YAML so we exercise the actual artifact the deserializer consumes.
      template = YAML.load(builder.to_yaml, aliases: true)
      created_object_ids = MultiTenancy::Templates::TenantDeserializer.new.deserialize(template, validate: validate)
      RoleAssigner.new(ref_map).assign(created_object_ids, role_assignments)
      created_object_ids
    end

    # Steps that couldn't be imported (e.g. missing dates), for surfacing back to the client.
    def skipped_phases
      @phases_extractor&.skipped || []
    end

    private

    def run_extractor(klass, model)
      klass.new(rows_for(model), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale).run
    end

    def role_assignments
      Extractors::ProcessRolesExtractor.new(
        rows_for(:process_roles), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      ).run
    end

    def rows_for(model)
      @rows_by_model[model] || []
    end
  end
end
