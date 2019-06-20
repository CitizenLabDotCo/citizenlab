class WebApi::V1::Fast::UserSerializer < WebApi::V1::Fast::BaseSerializer

  attributes :id, :first_name, :last_name, :slug, :locale, :roles, :highest_role, :bio_multiloc, :registration_completed_at, :invite_status, :created_at, :updated_at
  
  attribute :email, if: Proc.new { |object, params|
    view_private_attributes? object, params
  }

  attribute :custom_field_values, if: Proc.new { |object, params|
    view_private_attributes? object, params
  }

  attribute :avatar do |object|
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :unread_notifications do |object|
    object.unread_notifications.size
  end

  has_many :granted_permissions, serializer: WebApi::V1::PermissionSerializer do |object, params|
    params[:granted_permissions]
  end


  def self.view_private_attributes? object, params={}
    Pundit.policy!(params[:current_user], object).view_private_attributes?
  end

end
