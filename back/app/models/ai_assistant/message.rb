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
    # Bedrock takes 5 documents per request, and every turn sends all files of the conversation.
    MAX_CONVERSATION_FILES = 5
    # Every turn sends the files again, and text goes into the message as is, so it gets a lower cap.
    MAX_FILE_SIZE = 4.megabytes
    MAX_TEXT_FILE_SIZE = 100.kilobytes
    TEXT_FILE_EXTENSIONS = %w[.md .txt].freeze

    # Touches the conversation, so a running turn shows its progress.
    belongs_to :conversation, class_name: 'AIAssistant::Conversation', inverse_of: :messages, touch: true
    has_many :tool_calls, -> { order(:created_at, :id) }, class_name: 'AIAssistant::ToolCall', dependent: :destroy, inverse_of: :message

    enum :role, ROLES.index_by(&:itself)

    validates :content, length: { maximum: MAX_CONTENT_LENGTH }, if: :user?
    validates :file_ids, length: { maximum: MAX_FILES }
    validate :content_or_files_present, if: :user?
    validate :files_usable, on: :create, if: -> { file_ids.present? }
    validate :conversation_files_within_limit, on: :create, if: -> { file_ids.present? }

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

    def conversation_files_within_limit
      return if conversation.messages.sum('cardinality(file_ids)') + file_ids.size <= MAX_CONVERSATION_FILES

      errors.add(:file_ids, :too_many_in_conversation)
    end

    def files_usable
      found = files.to_a
      return errors.add(:file_ids, :not_found) if found.size != file_ids.uniq.size
      return errors.add(:file_ids, :not_in_project) unless found.all? { |file| in_conversation_project?(file) }
      return errors.add(:file_ids, :ai_processing_not_allowed) unless found.all?(&:ai_processing_allowed)
      return errors.add(:file_ids, :unsupported_file_type) if found.any? { |file| unsupported?(file) }

      text_files = found.select { |file| text?(file) }
      errors.add(:file_ids, :not_utf8) unless text_files.all? { |file| utf8?(file) }
    end

    # Fails closed for records that don't belong to a project.
    def in_conversation_project?(file)
      project_id = conversation.subject.try(:project_id)
      project_id.present? && file.project_ids.include?(project_id)
    end

    def unsupported?(file)
      file.size.to_i > max_size(file) || !content_matches_extension?(file)
    end

    def max_size(file)
      text?(file) ? MAX_TEXT_FILE_SIZE : MAX_FILE_SIZE
    end

    # The client picks the name, so the content must match it: otherwise every later turn
    # fails, as each one sends the file again.
    def content_matches_extension?(file)
      case ::File.extname(file.name).downcase
      when '.pdf' then file.content.read.start_with?('%PDF-')
      when *TEXT_FILE_EXTENSIONS then true
      else false
      end
    end

    def text?(file)
      TEXT_FILE_EXTENSIONS.include?(::File.extname(file.name).downcase)
    end

    # Text files go into the message itself, so they must be valid UTF-8.
    def utf8?(file)
      file.content.read.dup.force_encoding(Encoding::UTF_8).valid_encoding?
    end
  end
end
