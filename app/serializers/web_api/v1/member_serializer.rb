class WebApi::V1::MemberSerializer < WebApi::V1::BaseSerializer
  attributes :first_name, :last_name, :slug, :email # TODO hide email for non-admins

  attribute :avatar, if: Proc.new { |object|
    object.avatar
  } do |object|
    object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :is_member, if: Proc.new { |object, params|
    params[:group_id]
  } do |object, params|
  	object.member_of? params[:group_id]
  end
end