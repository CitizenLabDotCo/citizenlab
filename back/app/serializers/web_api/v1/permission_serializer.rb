# frozen_string_literal: true

class WebApi::V1::PermissionSerializer < WebApi::V1::BaseSerializer
  attributes :action, :permitted_by, :global_custom_fields, :verification_expiry,
    :access_denied_explanation_multiloc, :created_at, :updated_at,
    :user_data_collection, :require_confirmed_email, :confirmed_email_expiry,
    :require_name, :require_password, :require_verification

  attribute :verification_enabled do |object|
    object.verification_enabled?
  end

  attribute :everyone_tracking_enabled do |object|
    object.everyone_tracking_enabled?
  end

  attribute :user_fields_in_form_descriptor do |permission|
    permission.user_fields_in_form_descriptor
  end

  attribute :permitted_by_everyone_allowed do |permission|
    permission.permitted_by_everyone_allowed?
  end

  belongs_to :permission_scope, polymorphic: true
  has_many :groups
  has_many :permissions_custom_fields
  has_many :custom_fields
end
