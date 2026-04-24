# frozen_string_literal: true

class WebApi::V1::UserSerializer < WebApi::V1::BaseSerializer
  PRIVATE = proc { |object, params| view_private_attributes? object, params }

  # Public attributes
  attributes :slug,
    :locale,
    :bio_multiloc,
    :invite_status, # Cannot be private as there is no current_user when an invite is accepted
    :registration_completed_at,
    :created_at,
    :updated_at

  attribute :last_name do |object, params|
    name_service(params).last_name(object)
  end

  attribute :first_name do |object, params|
    name_service(params).first_name(object)
  end

  attribute :display_name do |object, params|
    name_service(params).display_name(object)
  end

  attribute :no_name do |object|
    object.no_name?
  end

  attribute :avatar, if: proc { |object|
    object.avatar
  } do |object|
    object.avatar.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  # Private attributes
  attribute :roles, if: PRIVATE
  attribute :highest_role, if: PRIVATE
  attribute :email, if: PRIVATE
  attribute :last_active_at, if: PRIVATE
  attribute :block_start_at, if: PRIVATE
  attribute :block_end_at, if: PRIVATE
  attribute :block_reason, if: PRIVATE
  attribute :verified, if: PRIVATE
  attribute :followings_count, if: PRIVATE
  attribute :onboarding, if: PRIVATE

  attribute :no_password, if: PRIVATE do |object|
    object.no_password?
  end

  attribute :custom_field_values, if: PRIVATE do |object|
    CustomFieldService.remove_hidden_custom_fields(object.custom_field_values)
  end

  attribute :unread_notifications, if: PRIVATE do |object|
    object.unread_notifications.size
  end

  attribute :new_email, if: PRIVATE

  attribute :confirmation_required, if: PRIVATE do |user|
    user.confirmation_required?
  end

  attribute :blocked, if: PRIVATE do |object|
    object.blocked?
  end

  def self.name_service(params)
    UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
  end

  def self.view_private_attributes?(object, params = {})
    Pundit.policy!(user_context(params), object).view_private_attributes?
  end
end
