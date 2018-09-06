class WebApi::V1::Notifications::NotificationSerializer < ActiveModel::Serializer
  type :notification
  attributes :id, :type, :read_at, :created_at

  belongs_to :recipient, serializer: WebApi::V1::UserSerializer
  

  def type
    object.type.demodulize.underscore
  end
end
