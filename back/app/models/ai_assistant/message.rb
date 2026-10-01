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
    MAX_FILES = 3
    # Bedrock refuses documents above 4.5 MB.
    MAX_FILE_SIZE = 4.megabytes
    FILE_EXTENSIONS = %w[.pdf .md .txt].freeze

    belongs_to :conversation, class_name: 'AIAssistant::Conversation', inverse_of: :messages
    has_many :tool_calls, -> { order(:created_at, :id) }, class_name: 'AIAssistant::ToolCall', dependent: :destroy, inverse_of: :message

    enum :role, ROLES.index_by(&:itself)

    validates :content, length: { maximum: MAX_CONTENT_LENGTH }
    validates :file_ids, length: { maximum: MAX_FILES }
    validate :content_or_files_present, if: :user?
    validate :files_usable, on: :create, if: -> { file_ids.present? }

    before_validation :assign_position, on: :create

    def files
      Files::File.where(id: file_ids)
    end

    private

    def assign_position
      self.position ||= (conversation.messages.maximum(:position) || 0) + 1
    end

    def content_or_files_present
      errors.add(:content, :blank) if content.blank? && file_ids.blank?
    end

    def files_usable
      found = files.to_a
      if found.size != file_ids.uniq.size
        errors.add(:file_ids, :not_found)
      elsif found.any? { |file| !file.ai_processing_allowed }
        errors.add(:file_ids, :ai_processing_not_allowed)
      elsif found.any? { |file| unsupported?(file) }
        errors.add(:file_ids, :unsupported_file_type)
      end
    end

    def unsupported?(file)
      FILE_EXTENSIONS.exclude?(::File.extname(file.name).downcase) || file.size.to_i > MAX_FILE_SIZE
    end
  end
end
