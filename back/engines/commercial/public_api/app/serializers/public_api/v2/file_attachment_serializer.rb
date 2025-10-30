# frozen_string_literal: true

class PublicApi::V2::FileAttachmentSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :filename,
    :file_url,
    :file_size,
    :attachable_id,
    :attachable_type,
    :project_id,
    :created_at,
    :updated_at

  def filename
    object.file&.name
  end

  def file_url
    object.file&.content&.url
  end

  def file_size
    object.file&.size
  end

  def project_id
    case object.attachable_type
    when 'Idea', 'Phase', 'Event'
      object.attachable&.project_id
    when 'Project'
      object.attachable_id
    end
  end
end
