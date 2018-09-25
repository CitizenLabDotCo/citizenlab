class WebApi::V1::PermissionSerializer < ActiveModel::Serializer
  attributes :id, :action, :permitted_by, :created_at, :updated_at

  belongs_to :permittable
  has_many :groups
end
