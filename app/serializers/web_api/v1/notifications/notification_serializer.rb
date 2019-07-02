class WebApi::V1::Notifications::NotificationSerializer < WebApi::V1::BaseSerializer
  attributes :read_at, :created_at

  # Is this still necessary?
  attribute :type do |object|
    object.type.demodulize.underscore
  end

  belongs_to :recipient, record_type: :user, serializer: WebApi::V1::UserSerializer
end
