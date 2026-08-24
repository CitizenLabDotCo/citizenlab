# frozen_string_literal: true

# == Schema Information
#
# Table name: content_builder_custom_block_ai_sessions
#
#  id              :uuid             not null, primary key
#  custom_block_id :uuid             not null
#  created_by_id   :uuid
#  status          :string           default("active"), not null
#  transcript      :jsonb            not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_custom_block_ai_sessions_on_created_by_id    (created_by_id)
#  index_custom_block_ai_sessions_on_custom_block_id  (custom_block_id)
#
# Foreign Keys
#
#  fk_rails_...  (created_by_id => users.id) ON DELETE => nullify
#  fk_rails_...  (custom_block_id => content_builder_custom_blocks.id) ON DELETE => cascade
#
module ContentBuilder
  # An AI authoring conversation that produces {CustomBlockVersion versions} of a
  # {CustomBlock}. The endpoints driving the conversation live elsewhere; this model only
  # owns the persisted transcript and the session status.
  class CustomBlockAISession < ApplicationRecord
    STATUSES = %w[active closed].freeze

    belongs_to :custom_block, class_name: 'ContentBuilder::CustomBlock', inverse_of: :ai_sessions
    belongs_to :created_by, class_name: 'User', optional: true

    validates :status, inclusion: { in: STATUSES }
    validate :validate_transcript

    private

    def validate_transcript
      return if transcript.is_a?(Array)

      errors.add :transcript, :invalid, message: 'must be a JSON array'
    end
  end
end
