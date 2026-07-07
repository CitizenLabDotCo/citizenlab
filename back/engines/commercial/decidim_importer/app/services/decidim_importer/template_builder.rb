# frozen_string_literal: true

module DecidimImporter
  # Assembles the records held in a {RefMap} into a tenant-template hash
  # (`{ 'models' => { model_name => [attributes, …] } }`) consumable by
  # `MultiTenancy::Templates::TenantDeserializer`, and can render it as the YAML artifact.
  #
  # Models are emitted in dependency order so that every `*_ref` target is created before the
  # record that points at it (the deserializer iterates models, then records, in order and resolves
  # refs against already-created objects).
  class TemplateBuilder
    # Records that may be referenced must be listed before their referrers. Anything not listed is
    # appended afterwards in registration order.
    MODEL_ORDER = %w[
      user
      area
      project_folders/folder
      project
      project_image
      static_page
      files/file
      files/files_project
      content_builder/layout
      files/file_attachment
      phase
      custom_form
      custom_field
      custom_field_option
      custom_field_matrix_statement
      idea
      file_upload
      ideas_phase
      comment
      official_feedback
      follower
    ].freeze

    def initialize(ref_map)
      @ref_map = ref_map
    end

    # @return [Hash] the template hash. NOTE: cross-record refs are shared hash *objects*, so this
    #   structure must be deserialized (or YAML-dumped) without being deep-duplicated first.
    def models
      grouped = @ref_map.records.group_by(&:model_name)
      ordered_names = MODEL_ORDER + (grouped.keys - MODEL_ORDER)

      by_name = ordered_names.each_with_object({}) do |name, acc|
        records = grouped[name]
        next unless records

        acc[name] = records.map(&:attributes)
      end

      { 'models' => by_name }
    end

    # The YAML artifact. Shared attribute-hash objects are emitted as YAML anchors/aliases, so
    # `YAML.load(yaml, aliases: true)` round-trips back to a ref-resolvable structure.
    delegate :to_yaml, to: :models

    # Record count per model the template will create, in dependency (emission) order.
    # @return [Hash{String=>Integer}]
    def model_counts
      models['models'].transform_values(&:size)
    end

    # Record counts grouped by the project each record belongs to, for a per-project breakdown of the
    # dump summary. Each record is attributed to its owning project by following its `*_ref` links to a
    # `project` record (a phase via `project_ref`, a comment via its idea, a survey field via its form's
    # phase, …). Records with no path to a project (users, areas, scopes, folders) are grouped under
    # `nil`. Projects keep their registration order; each project's counts follow the model dependency
    # order, like {#model_counts}.
    #
    # @return [Hash{DecidimImporter::Record, nil => Hash{String=>Integer}}]
    def counts_by_project
      index = attributes_to_record
      file_projects = file_to_project_index(index)
      memo = {}.compare_by_identity

      grouped = @ref_map.records.each_with_object({}) do |record, result|
        project = project_for(record, index, file_projects, memo)
        (result[project] ||= Hash.new(0))[record.model_name] += 1
      end
      grouped.transform_values { |counts| order_counts(counts) }
    end

    private

    # Maps each record's attributes-hash back to the record by *object identity*, so a `*_ref` — which
    # holds the exact same attributes-hash object as its target — can be followed to that record. The
    # `compare_by_identity` matters: distinct records can have equal-by-value attributes.
    def attributes_to_record
      index = {}.compare_by_identity
      @ref_map.records.each { |record| index[record.attributes] = record }
      index
    end

    # A `Files::File` has no outgoing project ref of its own — it's tied to a project through the
    # `files_project` join — so resolve each file's owning project up front from those joins.
    def file_to_project_index(index)
      file_projects = {}.compare_by_identity
      @ref_map.records.each do |record|
        next unless record.model_name == 'files/files_project'

        file = index[record.attributes['file_ref']]
        project = index[record.attributes['project_ref']]
        file_projects[file.attributes] = project if file && project
      end
      file_projects
    end

    # The project a record belongs to, or nil. Memoised and cycle-guarded (the memo holds nil while a
    # record is being resolved, so a ref cycle returns nil rather than recursing forever).
    def project_for(record, index, file_projects, memo)
      return record if record.model_name == 'project'

      attrs = record.attributes
      return memo[attrs] if memo.key?(attrs)

      memo[attrs] = nil
      memo[attrs] = file_projects[attrs] || follow_refs_to_project(record, index, file_projects, memo)
    end

    def follow_refs_to_project(record, index, file_projects, memo)
      record.attributes.each do |attribute, value|
        next unless attribute.end_with?('_ref') && value.is_a?(Hash)

        target = index[value]
        project = target && project_for(target, index, file_projects, memo)
        return project if project
      end
      nil
    end

    def order_counts(counts)
      counts.sort_by { |model, _| MODEL_ORDER.index(model) || MODEL_ORDER.size }.to_h
    end
  end
end
