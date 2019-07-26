class WebApi::V1::UserSerializer < WebApi::V1::BaseSerializer
  attributes :first_name, :last_name, :slug, :locale, :roles, :highest_role, :bio_multiloc, :registration_completed_at, :invite_status, :created_at, :updated_at
  
  attribute :email, if: Proc.new { |object, params|
    view_private_attributes? object, params
  }

  attribute :custom_field_values, if: Proc.new { |object, params|
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

end
