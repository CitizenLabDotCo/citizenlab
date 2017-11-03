class Api::V1::External::Notifications::NotificationSerializer < ActiveModel::Serializer
  class CustomUserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :avatar
    def avatar
      object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end

  belongs_to :recipient, serializer: CustomUserSerializer

end