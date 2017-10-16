class Api::V1::MemberSerializer < ActiveModel::Serializer
  # include Knock::Authenticable

  attributes :id, :first_name, :last_name, :slug, :avatar, :is_member
  attribute :email # , if: :view_private_attributes?

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def is_member
    !object.memberships.select{ |m| m.group_id == instance_options[:group_id] }.empty?
  end

  # def view_private_attributes?
   #  Pundit.policy!(current_user, object).view_private_attributes?
  # end

end