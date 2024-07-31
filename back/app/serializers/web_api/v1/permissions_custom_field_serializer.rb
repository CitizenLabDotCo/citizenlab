# frozen_string_literal: true

class WebApi::V1::PermissionsCustomFieldSerializer < WebApi::V1::BaseSerializer
  attributes :required, :lock, :ordering, :created_at, :updated_at, :title_multiloc

  attribute :persisted do |object|
    object.persisted?
  end

  has_one :permission
  has_one :custom_field

  # Only return smart groups that have rules dependent on the permission field
  # NOTE: May result in a few n+1 queries, but is only used in the admin panel on a limited number of records
  has_many :groups do |field|
    field.groups.by_custom_field(field.custom_field_id)
  end
end
