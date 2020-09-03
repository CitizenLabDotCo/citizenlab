class WebApi::V1::UserSerializer < WebApi::V1::BaseSerializer
  attributes :first_name, :slug, :locale, :roles, :highest_role, :bio_multiloc, :registration_completed_at, :invite_status, :created_at, :updated_at
  
  attribute :last_name do |object, params|
    name_service = UserDisplayNameService.new(Tenant.current, current_user(params))
    name_service.last_name(object)
  end

  attribute :email, if: Proc.new { |object, params|
    view_private_attributes? object, params
  }

  attribute :custom_field_values, if: Proc.new { |object, params|
    view_private_attributes? object, params
  } do |object|
    remove_hidden_custom_fields(object.custom_field_values)
  end

  attribute :verified, if: Proc.new {|object, params|
    view_private_attributes? object, params
  }

  attribute :avatar, if: Proc.new { |object|
    object.avatar
  } do |object|
    object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :unread_notifications do |object|
    object.unread_notifications.size
  end

  has_many :granted_permissions, record_type: :permission, serializer: WebApi::V1::PermissionSerializer do |object, params|
    params[:granted_permissions]
  end


  def self.view_private_attributes? object, params={}
    Pundit.policy!(current_user(params), object).view_private_attributes?
  end

  private

  def self.remove_hidden_custom_fields(custom_field_values)
    hidden_keys = CustomField.where(key: custom_field_values.keys).hidden.pluck(:key)
    custom_field_values.except(*hidden_keys)
  end

end
