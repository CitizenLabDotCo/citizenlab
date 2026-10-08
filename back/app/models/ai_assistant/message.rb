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
  class Message < ApplicationRecord
    ROLES = %w[user assistant].freeze
    MAX_CONTENT_LENGTH = 5000

    belongs_to :conversation, class_name: 'AIAssistant::Conversation', inverse_of: :messages
    has_many :tool_calls, -> { order(:created_at, :id) }, class_name: 'AIAssistant::ToolCall', dependent: :destroy, inverse_of: :message

    enum :role, ROLES.index_by(&:itself)

    validates :content, length: { maximum: MAX_CONTENT_LENGTH }
    validates :content, presence: true, if: :user?

    before_validation :assign_position, on: :create

    private

    def assign_position
      self.position ||= (conversation.messages.maximum(:position) || 0) + 1
    end
  end
end
