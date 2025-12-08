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
      return @layout.craftjs_json if @layout.craftjs_json.blank?

      updated_json = deep_dup(@layout.craftjs_json)
      cleanup_orphaned_file_attachments(updated_json)
      process_nodes(updated_json)

      updated_json
    end

    private

    # Removes file attachments that exist in the database but are not referenced in the craftjs JSON
    def cleanup_orphaned_file_attachments(json_data)
      return unless @layout.persisted?

      # Get all file_ids currently referenced in the JSON
      referenced_file_ids = collect_referenced_file_ids(json_data)

      # Find file attachments that are attached to this layout but not in the JSON
      orphaned_attachments = ::Files::FileAttachment
        .where(attachable: @layout)
        .where.not(file_id: referenced_file_ids)

      orphaned_attachments.find_each do |attachment|
        Rails.logger.info "Removing orphaned FileAttachment #{attachment.id} (file_id: #{attachment.file_id}) from Layout #{@layout.id}"
        attachment.destroy
      end
    end

    # Collects all file_ids that are currently referenced in the craftjs JSON
    def collect_referenced_file_ids(json_data, file_ids = [])
      return file_ids unless json_data.is_a?(Hash)

      json_data.each_value do |node_data|
        next unless node_data.is_a?(Hash)

        # Check if this node has a fileId in props
        if node_data['props'].is_a?(Hash) && node_data['props']['fileId'].present?
          file_ids << node_data['props']['fileId']
        end

        # Recursively check nested nodes
        if node_data['nodes']&.is_a?(Array)
          node_data['nodes'].each do |child_node_id|
            collect_referenced_file_ids({ child_node_id => json_data[child_node_id] }, file_ids) if json_data[child_node_id]
          end
        end
      end

      file_ids.uniq
    end

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
        rescue StandardError => e
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

      return if file_id.blank?

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
        begin
          obj.dup
        rescue StandardError
          obj
        end
      end
    end
  end
end