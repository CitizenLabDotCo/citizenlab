# frozen_string_literal: true

class PublicApi::V2::FileAttachmentSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :filename,
    :file_url,
    :file_size,
    :attachable_id,
    :attachable_type,
    :project_id,
    :custom_field_key,
    :created_at,
    :updated_at

  def filename
    object.file&.name
  end

  def file_url  
    object.file&.file&.url
  end

  def file_size
    object.file&.size
  end

  def project_id
    case object.attachable_type
    when 'Idea'
      object.attachable&.project_id
    when 'Phase'
      object.attachable&.project_id
    when 'Project'
      object.attachable_id
    when 'Event'
      object.attachable&.project_id
    end
  end

  def custom_field_key
    # Logic to find which custom field this attachment belongs to
    # by checking the attachable's custom_field_values
    return nil unless object.attachable.respond_to?(:custom_field_values)
    
    object.attachable.custom_field_values&.find do |key, value|
      attachment_ids = Array(value).map(&:to_s)
      attachment_ids.include?(object.id.to_s)
    end&.first
  end
end