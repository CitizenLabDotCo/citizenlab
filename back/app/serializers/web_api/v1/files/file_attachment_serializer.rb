class WebApi::V1::Files::FileAttachmentSerializer < WebApi::V1::BaseSerializer
  attributes :position, :created_at, :updated_at

  # File details are directly accessible in the attachment.
  # This eliminates the need for extra requests when displaying a list of attachments.
  # It also allows file access permissions to be more restrictive, since in most cases
  # users do not need to access the file resource directly.
  attribute(:file_url) { |attachment| attachment.file.content.url }
  attribute(:file_name) { |attachment| attachment.file.name }
  attribute(:file_size) { |attachment| attachment.file.size }

  belongs_to :file, serializer: WebApi::V1::FileV2Serializer

  belongs_to :attachable, serializer: lambda { |record, _params|
    case record
    when Phase then WebApi::V1::PhaseSerializer
    when Project then WebApi::V1::ProjectSerializer
    when ProjectFolders::Folder then WebApi::V1::FolderSerializer
    when Event then WebApi::V1::EventSerializer
    when Idea then WebApi::V1::IdeaSerializer
    when StaticPage then WebApi::V1::StaticPageSerializer
    when ContentBuilder::Layout then ContentBuilder::WebApi::V1::LayoutSerializer
    end
  }
end
