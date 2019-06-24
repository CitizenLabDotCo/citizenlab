class WebApi::V1::Fast::Notifications::NotificationSerializer < WebApi::V1::Fast::BaseSerializer
  # type :notification
  attributes :read_at, :created_at

  # belongs_to :recipient, serializer: WebApi::V1::UserSerializer
  

  attribute :type do |object|
    object.type.demodulize.underscore
  end
end
