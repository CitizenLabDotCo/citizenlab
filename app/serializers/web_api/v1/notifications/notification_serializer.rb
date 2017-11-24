class WebApi::V1::Notifications::NotificationSerializer < ActiveModel::Serializer
  type :notification
  attributes :id, :type, :read_at, :created_at

  def type
    object.type.demodulize.underscore
  end
end
