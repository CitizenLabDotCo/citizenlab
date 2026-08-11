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

    # `locked_custom_fields` returns keys, so the constraints are keyed by key as
    # well. Not every locked field has a code (e.g. verification methods that
    # lock a field configured by key), so we cannot key them by code.
    CustomField.where(key: locked_custom_field_keys).to_h { |field| [field.key.to_sym, { locked: true }] }
  end
end
