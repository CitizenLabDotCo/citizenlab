# frozen_string_literal: true

class WebApi::V1::PermissionsCustomFieldSerializer < WebApi::V1::BaseSerializer
  attributes :required, :created_at, :updated_at

  has_one :permission
  has_one :custom_field
end
