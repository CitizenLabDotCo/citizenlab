# frozen_string_literal: true

class WebApi::V1::PermissionSerializer < WebApi::V1::BaseSerializer
  attributes :action, :permitted_by, :global_custom_fields, :created_at, :updated_at

  belongs_to :permission_scope, polymorphic: true
  has_many :groups
  has_many :permissions_custom_fields
  has_many :custom_fields
end
