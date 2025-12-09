# frozen_string_literal: true

module ContentBuilder
  class FileAttachmentProcessorService
    def initialize(layout)
      @layout = layout
    end

    def process_file_attachments
      return @layout.craftjs_json if @layout.craftjs_json.blank?

      cleanup_orphaned_attachments
      create_missing_attachments

      @layout.craftjs_json
    end

    private

    def cleanup_orphaned_attachments
      return unless @layout.persisted?

      referenced_file_ids = @layout.craftjs_json.each_value.filter_map do |node|
        node.dig('props', 'fileId') if file_attachment_widget?(node)
      end

      ::Files::FileAttachment
        .where(attachable: @layout)
        .where.not(file_id: referenced_file_ids)
        .destroy_all
    end

    def create_missing_attachments
      @layout.craftjs_json.each_value do |node|
        next unless file_attachment_widget?(node) && needs_file_attachment?(node)

        create_file_attachment(node)
      end
    end

    def file_attachment_widget?(node)
      return false unless node.is_a?(Hash)

      type = node['type']
      resolved_name = type.is_a?(Hash) ? type['resolvedName'] : type
      resolved_name == 'FileAttachment'
    end

    def needs_file_attachment?(node)
      node.dig('props', 'fileId').present? && node.dig('props', 'fileAttachmentId').blank?
    end

    def create_file_attachment(node)
      file_id = node.dig('props', 'fileId')
      return if file_id.blank?

      file_attachment = ::Files::FileAttachment.find_or_create_by!(
        file_id: file_id,
        attachable: @layout
      )

      node['props']['fileAttachmentId'] = file_attachment.id
      Rails.logger.info "FileAttachment #{file_attachment.id} for Layout #{@layout.id}"
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to create file attachment: #{e.message}"
    end
  end
end
