# frozen_string_literal: true

module ContentBuilder
  class FileAttachmentProcessorService
    def initialize(layout)
      @layout = layout
    end

    # Extracts all fileIds from FileAttachment widgets in craftjs_json.
    # Used by LayoutPolicy to authorize file attachments.
    def self.extract_file_ids(craftjs_json)
      return [] if craftjs_json.blank?

      craftjs_json.each_value.filter_map do |node|
        node.dig('props', 'fileId') if file_attachment_widget?(node)
      end
    end

    def self.file_attachment_widget?(node)
      return false unless node.is_a?(Hash)

      type = node['type']
      resolved_name = type.is_a?(Hash) ? type['resolvedName'] : type
      resolved_name == 'FileAttachment'
    end

    def process_file_attachments
      return @layout.craftjs_json if @layout.craftjs_json.blank?

      referenced_file_ids = self.class.extract_file_ids(@layout.craftjs_json)
      cleanup_orphaned_attachments(referenced_file_ids)
      create_attachments(referenced_file_ids)

      @layout.craftjs_json
    end

    private

    def cleanup_orphaned_attachments(referenced_file_ids)
      return unless @layout.persisted?

      ::Files::FileAttachment
        .where(attachable: @layout)
        .where.not(file_id: referenced_file_ids)
        .destroy_all
    end

    def create_attachments(referenced_file_ids)
      referenced_file_ids.each do |file_id|
        next if ::Files::FileAttachment.exists?(file_id: file_id, attachable: @layout)

        create_file_attachment(file_id)
      end
    end

    def create_file_attachment(file_id)
      ::Files::FileAttachment.create!(
        file_id: file_id,
        attachable: @layout
      )
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to create file attachment for file #{file_id}: #{e.message}"
    end
  end
end
