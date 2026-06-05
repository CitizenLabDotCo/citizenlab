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
      custom_field
      custom_field_option
      user
      project_folders/folder
      project
      phase
    ].freeze

    def initialize(ref_map)
      @ref_map = ref_map
    end

    # @return [Hash] the template hash. NOTE: cross-record refs are shared hash *objects*, so this
    #   structure must be deserialized (or YAML-dumped) without being deep-duplicated first.
    def models
      grouped = @ref_map.records.group_by(&:model_name)
      ordered_names = MODEL_ORDER + (grouped.keys - MODEL_ORDER)

      models = ordered_names.each_with_object({}) do |name, acc|
        records = grouped[name]
        next unless records

        acc[name] = records.map(&:attributes)
      end

      { 'models' => models }
    end

    # The YAML artifact. Shared attribute-hash objects are emitted as YAML anchors/aliases, so
    # `YAML.load(yaml, aliases: true)` round-trips back to a ref-resolvable structure.
    delegate :to_yaml, to: :models

    # Record count per model the template will create, in dependency (emission) order.
    # @return [Hash{String=>Integer}]
    def model_counts
      models['models'].transform_values(&:size)
    end
  end
end
