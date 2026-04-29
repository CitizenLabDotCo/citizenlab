class WebApi::V1::SpaceSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :created_at, :updated_at

  has_many :folders, serializer: ::WebApi::V1::FolderSerializer
  has_many :projects, serializer: ::WebApi::V1::ProjectSerializer

  has_many :moderators, serializer: ::WebApi::V1::UserSerializer do |object, params|
    params.dig(:moderators_per_space, object.id) || []
  end
end
