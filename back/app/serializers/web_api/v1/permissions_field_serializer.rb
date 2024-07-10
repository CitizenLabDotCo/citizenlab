# frozen_string_literal: true

class WebApi::V1::PermissionsFieldSerializer < WebApi::V1::BaseSerializer
  attributes :field_type, :required, :enabled, :config, :locked, :ordering, :created_at, :updated_at

  has_one :permission
  has_one :custom_field
end
