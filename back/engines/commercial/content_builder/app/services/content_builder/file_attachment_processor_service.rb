# frozen_string_literal: true

module ContentBuilder
  class FileAttachmentProcessorService
    def initialize(layout)
      @layout = layout
    end

    # Extracts all fileIds from FileAttachment widgets in craftjs_json
    # Used by LayoutPolicy to authorize file attachments
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

    # Syncs file attachments based on fileIds referenced in craftjs_json.
    # Creates new attachments for new fileIds and removes orphaned attachments.
    def sync_file_attachments
      return if @layout.craftjs_json.blank?

      referenced_file_ids = self.class.extract_file_ids(@layout.craftjs_json)
      create_missing_attachments(referenced_file_ids)
      cleanup_orphaned_attachments(referenced_file_ids)
    end

    private

    def create_missing_attachments(file_ids)
      file_ids.each do |file_id|
        ::Files::FileAttachment.find_or_create_by!(
          file_id: file_id,
          attachable: @layout
        )
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.error "Failed to create file attachment for file #{file_id}: #{e.message}"
      end
    end

    def cleanup_orphaned_attachments(referenced_file_ids)
      return unless @layout.persisted?

      ::Files::FileAttachment
        .where(attachable: @layout)
        .where.not(file_id: referenced_file_ids)
        .destroy_all
    end
  end
end
