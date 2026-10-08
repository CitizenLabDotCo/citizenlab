# frozen_string_literal: true

# == Schema Information
#
# Table name: ai_assistant_conversations
#
#  id              :uuid             not null, primary key
#  user_id         :uuid             not null
#  context_type    :string           not null
#  context_id      :uuid             not null
#  context_key     :string           not null
#  locale          :string           not null
#  status          :string           default("idle"), not null
#  last_error_code :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_ai_assistant_conversations_on_context  (context_type,context_id)
#  index_ai_assistant_conversations_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id) ON DELETE => cascade
#
module AIAssistant
  # A chat between a user and the AI assistant about one record (the context), e.g. the
  # survey of a phase. +context_key+ says which assistant context (prompt and tools) applies.
  class Conversation < ApplicationRecord
    STATUSES = %w[idle running awaiting_approval failed].freeze

    belongs_to :user
    belongs_to :context, polymorphic: true

    has_many :messages, -> { order(:position) }, class_name: 'AIAssistant::Message', dependent: :destroy, inverse_of: :conversation
    has_many :tool_calls, through: :messages

    enum :status, STATUSES.index_by(&:itself)

    validates :context_key, :locale, presence: true

    # The proposals can no longer be decided on: the model will see them as expired.
    def expire_proposals!
      transaction do
        tool_calls.proposed.find_each do |tool_call|
          tool_call.update!(status: 'expired', result: { expired: true }.to_json)
        end
        update!(status: 'idle') if awaiting_approval?
      end
    end
  end
end
