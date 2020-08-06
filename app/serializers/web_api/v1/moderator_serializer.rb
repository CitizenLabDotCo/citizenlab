class WebApi::V1::ModeratorSerializer < WebApi::V1::BaseSerializer
  attributes :first_name, :last_name, :slug, :roles, :email # TODO hide email for non-admins

  attribute :avatar, if: Proc.new { |object|
    object.avatar
  } do |object|
    object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :is_moderator, if: Proc.new { |object, params|
    params[:project_id]
  } do |object, params|
    object.project_moderator? params[:project_id]
  end

end