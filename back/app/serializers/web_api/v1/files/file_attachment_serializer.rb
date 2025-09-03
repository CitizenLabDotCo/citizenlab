class WebApi::V1::Files::FileAttachmentSerializer < WebApi::V1::BaseSerializer
  attributes :position, :created_at, :updated_at

  belongs_to :file, serializer: WebApi::V1::FileV2Serializer

  belongs_to :attachable, serializer: lambda { |record, _params|
    case record
    when Phase then WebApi::V1::PhaseSerializer
    when Project then WebApi::V1::ProjectSerializer
    when ProjectFolders::Folder then WebApi::V1::FolderSerializer
    when Event then WebApi::V1::EventSerializer
    when Idea then WebApi::V1::IdeaSerializer
    when StaticPage then WebApi::V1::StaticPageSerializer
    end
  }
end
