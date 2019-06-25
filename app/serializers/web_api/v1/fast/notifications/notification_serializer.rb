class WebApi::V1::Fast::Notifications::NotificationSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :read_at, :created_at

  # Is this still necessary?
  attribute :type do |object|
    object.type.demodulize.underscore
  end

  belongs_to :recipient, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer
end
