# frozen_string_literal: true

class PublicApi::V2::FileAttachmentSerializer < PublicApi::V2::BaseSerializer
  attributes :id, :project_id, :created_at, :updated_at, :attachable_type, :attachable_id

  attribute(:file_url) { object.file.content.url }
  attribute(:file_name) { object.file.name }
  attribute(:file_size) { object.file.size }

  def project_id
    case object.attachable_type
    when 'Idea', 'Phase', 'Event'
      object.attachable&.project_id
    when 'Project'
      object.attachable_id
    end
  end
end
