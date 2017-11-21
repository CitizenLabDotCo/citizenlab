class WebApi::V1::MemberSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :slug, :avatar, :is_member
  attribute :email

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def is_member
  	object.member_of? instance_options[:group_id]
  end

end