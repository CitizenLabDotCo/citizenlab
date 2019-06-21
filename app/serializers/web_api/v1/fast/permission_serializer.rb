class WebApi::V1::Fast::PermissionSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :action, :permitted_by, :created_at, :updated_at

  belongs_to :permittable, polymorphic: true
  has_many :groups
end
