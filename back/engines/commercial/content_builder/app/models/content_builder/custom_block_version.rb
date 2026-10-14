# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_custom_block_versions
#
#  id                       :uuid             not null, primary key
#  custom_block_id          :uuid             not null
#  number                   :integer          not null
#  sdk_version              :string           default("v1"), not null
#  source                   :text             not null
#  bundle                   :text             not null
#  manifest                 :jsonb            not null
#  messages                 :jsonb            not null
#  toolchain                :jsonb            not null
#  generation_transcript_id :uuid
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  index_content_builder_custom_block_versions_on_custom_block_id  (custom_block_id)
#  index_custom_block_versions_on_custom_block_id_and_number       (custom_block_id,number) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (custom_block_id => content_builder_custom_blocks.id) ON DELETE => cascade
#
module ContentBuilder
  # An immutable snapshot of a {CustomBlock}: the authored source, the compiled bundle
  # the front-end imports at runtime, the manifest describing what the block needs and
  # where it can be used, and the message catalogues it renders.
  #
  # A version is only ever written complete. The build (compile, typecheck, lint, SQL
  # extraction) runs before the record is created, so there is no partially built state
  # to render around: if a row exists, its bundle runs.
  class CustomBlockVersion < ApplicationRecord
    # What the settings sidebar can render a control for.
    CONFIG_FIELD_TYPES = %w[string number integer boolean].freeze

    belongs_to :custom_block, class_name: 'ContentBuilder::CustomBlock', inverse_of: :versions

    before_validation :set_number, on: :create

    validates :number, presence: true, uniqueness: { scope: :custom_block_id }
    validates :sdk_version, presence: true
    validates :source, presence: true
    validates :bundle, presence: true
    validate :validate_manifest
    validate :validate_messages

    # Read-only once written: the bundle is served with immutable cache headers and a
    # layout pins this exact number, so changing it, or deleting it by itself, would
    # silently alter a report that was already reviewed. Deleting the block it belongs
    # to takes its versions with it.
    def readonly?
      persisted?
    end

    # The reporting queries the block runs, extracted from the source at build time so
    # that "which blocks read this view?" is a database question.
    def queries
      manifest['queries'] || []
    end

    private

    def set_number
      return if number.present?

      max_number = self.class.where(custom_block_id: custom_block_id).maximum(:number)
      self.number = (max_number || 0) + 1
    end

    def validate_manifest
      if !manifest.is_a?(Hash)
        errors.add :manifest, :invalid, message: 'must be a JSON object'
        return
      end

      validate_config_schema
      validate_queries
    end

    # A JSON Schema object: the sidebar renders one control per entry in +properties+.
    def validate_config_schema
      schema = manifest['config_schema']
      return if schema.nil?

      if !schema.is_a?(Hash) || (schema.key?('type') && schema['type'] != 'object')
        errors.add :manifest, :config_schema_invalid,
          message: 'config_schema must be a JSON Schema object'
        return
      end

      if !schema['properties'].nil? && !schema['properties'].is_a?(Hash)
        errors.add :manifest, :config_schema_invalid, message: 'config_schema properties must be an object'
        return
      end

      (schema['properties'] || {}).each { |key, field| validate_config_field(key, field) }
    end

    # The shape the settings sidebar reads without checking. ChartBlockAuthor rejects
    # more than this, earlier and with messages written for the model; these are the
    # few the stored row has to guarantee whatever wrote it.
    def validate_config_field(key, field)
      unless field.is_a?(Hash)
        errors.add :manifest, :config_schema_invalid, message: "config_schema field #{key} must be an object"
        return
      end

      unless CONFIG_FIELD_TYPES.include?(field['type'].to_s)
        errors.add :manifest, :config_schema_invalid,
          message: "config_schema field #{key} has an unsupported type"
      end

      return if field['enum'].nil? || (field['enum'].is_a?(Array) && field['enum'].all?(String))

      errors.add :manifest, :config_schema_invalid,
        message: "config_schema field #{key} enum must be an array of strings"
    end

    def validate_queries
      queries = manifest['queries']
      return if queries.nil? || (queries.is_a?(Array) && queries.all?(String))

      errors.add :manifest, :queries_invalid, message: 'queries must be an array of SQL strings'
    end

    def validate_messages
      return if messages.is_a?(Hash)

      errors.add :messages, :invalid, message: 'must be a JSON object'
    end
  end
end
