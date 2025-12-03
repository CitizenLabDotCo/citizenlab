# frozen_string_literal: true

module ContentBuilder
  class FileAttachmentProcessorService
    def initialize(layout)
      @layout = layout
    end

    # Processes the craftjs JSON to create file attachments for FileAttachment widgets
    # that have fileId but no fileAttachmentId, then updates the JSON with the new
    # fileAttachmentIds.
    def process_file_attachments
      return @layout.craftjs_json unless @layout.craftjs_json.present?

      updated_json = deep_dup(@layout.craftjs_json)
      process_nodes(updated_json)
      
      updated_json
    end

    private

    def process_nodes(json_data)
      return unless json_data.is_a?(Hash)

      json_data.each do |key, node_data|
        next unless node_data.is_a?(Hash)

        begin
          # Check if this is a FileAttachment widget node that needs processing
          if file_attachment_widget?(node_data) && needs_file_attachment?(node_data)
            Rails.logger.info "Processing FileAttachment widget in node #{key}"
            create_and_update_file_attachment(node_data)
          end

          # Recursively process nested nodes
          if node_data['nodes']&.is_a?(Array)
            node_data['nodes'].each do |child_node_id|
              process_nodes({ child_node_id => json_data[child_node_id] }) if json_data[child_node_id]
            end
          end
        rescue => e
          Rails.logger.error "Error processing node #{key}: #{e.message}"
          Rails.logger.error "Node data: #{node_data.inspect}"
          Rails.logger.error e.backtrace.join("\n")
          # Continue processing other nodes even if one fails
        end
      end
    end

    def file_attachment_widget?(node_data)
      type_data = node_data['type']
      case type_data
      when Hash
        type_data['resolvedName'] == 'FileAttachment'
      when String
        type_data == 'FileAttachment'
      else
        false
      end
    end

    def needs_file_attachment?(node_data)
      props = node_data['props'] || {}
      props['fileId'].present? && props['fileAttachmentId'].blank?
    end

    def create_and_update_file_attachment(node_data)
      props = node_data['props'] || {}
      file_id = props['fileId']

      return unless file_id.present?

      # Create the file attachment
      file_attachment = ::Files::FileAttachment.create!(
        file_id: file_id,
        attachable: @layout
      )

      # Update the node props with the new file attachment ID
      props['fileAttachmentId'] = file_attachment.id
      node_data['props'] = props

      Rails.logger.info "Created FileAttachment #{file_attachment.id} for Layout #{@layout.id}"
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to create file attachment for file #{file_id}, layout #{@layout.id}: #{e.message}"
      # Continue processing other nodes even if one fails
    end

    def deep_dup(obj)
      case obj
      when Hash
        obj.transform_values { |v| deep_dup(v) }
      when Array
        obj.map { |v| deep_dup(v) }
      else
        obj.dup rescue obj
      end
    end
  end
end