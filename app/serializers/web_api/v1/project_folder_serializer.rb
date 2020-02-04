class WebApi::V1::ProjectFolderSerializer < WebApi::V1::BaseSerializer

  attributes :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :created_at, :updated_at

  has_many :projects

end
