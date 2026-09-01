# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_custom_block_versions
#
#  id              :uuid             not null, primary key
#  custom_block_id :uuid             not null
#  number          :integer          not null
#  source          :text             default(""), not null
#  bundle          :text             default(""), not null
#  manifest        :jsonb            not null
#  messages        :jsonb            not null
#  sdk_version     :integer          default(1), not null
#  toolchain       :jsonb            not null
#  ai_session_id   :uuid
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
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
  # that the front-end imports at runtime, the manifest describing what the block needs
  # and where it can be used, and the message catalogs it renders.
  class CustomBlockVersion < ApplicationRecord
    belongs_to :custom_block, class_name: 'ContentBuilder::CustomBlock', inverse_of: :versions

    before_validation :set_number, on: :create

    validates :number, presence: true, uniqueness: { scope: :custom_block_id }
    validate :validate_manifest
    validate :validate_messages

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

      config_schema = manifest['config_schema']
      return if !manifest.key?('config_schema') || config_schema.is_a?(Array)

      errors.add :manifest, :config_schema_invalid, message: 'config_schema must be an array'
    end

    def validate_messages
      return if messages.is_a?(Hash)

      errors.add :messages, :invalid, message: 'must be a JSON object'
    end
  end
end
