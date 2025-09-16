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

    unless phase.is_a?(Phase)
      false
    end

    phase.pmethod.user_fields_in_form?
  end

  # Attribute used in frontend to render access rights UI
  attribute :user_fields_in_form_frontend_descriptor do |permission|
    # If the permission is not about posting an idea in a native survey phase
    # or community monitor phase,
    # we don't support this attribute
    unsupported_descriptor = {
      value: nil,
      locked: true,
      explanation: 'user_fields_in_survey_not_supported_for_participation_method'
    }

    unless permission.action == 'posting_idea'
      return unsupported_descriptor
    end

    phase = permission.permission_scope
    has_survey_form = phase.is_a?(Phase) && phase.supports_survey_form?

    unless has_survey_form
      return unsupported_descriptor
    end

    if permission.permitted_by == 'everyone'
      if permission.user_data_collection == 'anonymous'
        {
          value: nil,
          locked: true,
          explanation: 'with_these_settings_cannot_ask_demographic_fields'
        }
      else
        {
          value: true,
          locked: true,
          explanation: 'cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone'
        }
      end
    elsif permission.user_data_collection == 'anonymous'
      {
        value: false,
        locked: true,
        explanation: 'with_these_settings_can_only_ask_demographic_fields_in_registration_flow'
      }
    else
      {
        value: permission.user_fields_in_form,
        locked: false,
        explanation: nil
      }
    end
  end

  belongs_to :permission_scope, polymorphic: true
  has_many :groups
  has_many :permissions_custom_fields
  has_many :custom_fields
end
