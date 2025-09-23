# frozen_string_literal: true

class WebApi::V1::PermissionSerializer < WebApi::V1::BaseSerializer
  attributes :action, :permitted_by, :global_custom_fields, :verification_expiry,
    :access_denied_explanation_multiloc, :created_at, :updated_at,
    :user_data_collection

  attribute :verification_enabled do |object|
    object.verification_enabled?
  end

  attribute :everyone_tracking_enabled do |object|
    object.everyone_tracking_enabled?
  end

  attribute :user_fields_in_form do |permission|
    phase = permission.permission_scope
    next false unless phase.is_a?(Phase)

    phase.pmethod.user_fields_in_form?
  end

  # Attribute used in frontend to render access rights UI
  attribute :user_fields_in_form_frontend_descriptor do |permission|
    permission.user_fields_in_form_frontend_descriptor
  end

  belongs_to :permission_scope, polymorphic: true
  has_many :groups
  has_many :permissions_custom_fields
  has_many :custom_fields
end
