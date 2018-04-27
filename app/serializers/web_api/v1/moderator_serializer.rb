class WebApi::V1::ModeratorSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :slug, :avatar, :roles, :is_moderator
  attribute :email

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def is_moderator
  	object.project_moderator? instance_options[:project_id]
  end

end