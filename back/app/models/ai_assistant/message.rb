# frozen_string_literal: true

# == Schema Information
#
# Table name: ai_assistant_messages
#
#  id              :uuid             not null, primary key
#  conversation_id :uuid             not null
#  position        :integer          not null
#  role            :string           not null
#  content         :text
#  file_ids        :uuid             default([]), not null, is an Array
#  input_tokens    :integer
#  output_tokens   :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  displayed       :boolean          default(TRUE), not null
#  replayed        :boolean          default(TRUE), not null
#
# Indexes
#
#  index_ai_assistant_messages_on_conversation_id_and_position  (conversation_id,position) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (conversation_id => ai_assistant_conversations.id) ON DELETE => cascade
#
module AIAssistant
  # One message of a conversation. Most are both shown in the chat and sent back to the
  # model on the next turn. The report builder splits the two: the chat shows what the
  # admin typed and the closing reply, while the model is sent the full prompts and
  # every step of the run.
  class Message < ApplicationRecord
    ROLES = %w[user assistant].freeze
    MAX_CONTENT_LENGTH = 5000

    # Touches the conversation, so a running turn shows its progress.
    belongs_to :conversation, class_name: 'AIAssistant::Conversation', inverse_of: :messages, touch: true
    has_many :tool_calls, -> { order(:created_at, :id) }, class_name: 'AIAssistant::ToolCall', dependent: :destroy, inverse_of: :message

    enum :role, ROLES.index_by(&:itself)

    validates :content, presence: true, if: :user?
    # Only text a person typed. A prompt the app writes carries context and can be much longer.
    validates :content, length: { maximum: MAX_CONTENT_LENGTH }, if: -> { user? && displayed? }
    validate :validate_has_an_audience

    before_validation :assign_position, on: :create

    private

    def validate_has_an_audience
      return if displayed? || replayed?

      errors.add :base, :no_audience, message: 'a message must be displayed, replayed or both'
    end

    def assign_position
      self.position ||= (conversation.messages.maximum(:position) || 0) + 1
    end
  end
end
