# frozen_string_literal: true

class WebApi::V1::UserSerializer < WebApi::V1::BaseSerializer
  attributes :slug,
    :locale,
    :roles,
    :highest_role,
    :bio_multiloc,
    :registration_completed_at,
    :invite_status,
    :blocked,
    :block_start_at,
    :block_end_at,
    :block_reason,
    :followings_count,
    :onboarding,
    :created_at,
    :updated_at

  attribute :last_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.last_name(object)
  end

  attribute :first_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.first_name(object)
  end

  attribute :display_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.display_name(object)
  end

  attribute :no_name do |object|
    object.no_name?
  end

  attribute :no_password, if: proc { |object, params|
    view_private_attributes? object, params
  } do |object|
    object.no_password?
  end

  attribute :email, if: proc { |object, params|
    view_private_attributes? object, params
  }

  attribute :last_active_at, if: proc { |object, params|
    view_private_attributes? object, params
  }

  attribute :custom_field_values, if: proc { |object, params|
    view_private_attributes? object, params
  } do |object|
    CustomFieldService.remove_hidden_custom_fields(object.custom_field_values)
  end

  attribute :avatar, if: proc { |object|
    object.avatar
  } do |object|
    object.avatar.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :unread_notifications, if: proc { |object, params| object == current_user(params) } do |object|
    object.unread_notifications.size
  end

  attribute :confirmation_required do |user|
    user.confirmation_required?
  end

  attribute :blocked, if: proc { |object, params|
    view_private_attributes? object, params
  } do |object|
    object.blocked?
  end

  attribute :block_start_at, if: proc { |object, params|
    view_private_attributes? object, params
  }

  attribute :block_end_at, if: proc { |object, params|
    view_private_attributes? object, params
  }

  attribute :block_reason, if: proc { |object, params|
    view_private_attributes? object, params
  }

  def self.view_private_attributes?(object, params = {})
    Pundit.policy!(user_context(params), object).view_private_attributes?
  end
end

WebApi::V1::UserSerializer.include(Verification::Patches::WebApi::V1::UserSerializer)
