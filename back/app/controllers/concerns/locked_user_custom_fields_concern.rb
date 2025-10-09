# frozen_string_literal: true

module LockedUserCustomFieldsConcern
  extend ActiveSupport::Concern

  private

  def jsonapi_serializer_params_with_locked_fields
    constraints = build_locked_custom_fields_constraints
    jsonapi_serializer_params({ constraints: constraints })
  end

  def build_locked_custom_fields_constraints
    return {} unless current_user

    locked_custom_field_keys = Verification::VerificationService.new.locked_custom_fields(current_user).map(&:to_s)
    constraints = {}

    # Find the corresponding codes for the locked custom field keys
    # The serializer expects constraints keyed by 'code', not 'key'
    CustomField.where(key: locked_custom_field_keys).each do |field|
      code_key = field.code&.to_sym
      constraints[code_key] = { locked: true } if code_key
    end

    constraints
  end
end
