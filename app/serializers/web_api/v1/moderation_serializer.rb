class WebApi::V1::ModerationSerializer < WebApi::V1::BaseSerializer
  set_type :moderation

  attributes :moderatable_type, :content_title_multiloc, :content_body_multiloc, :content_slug, :belongs_to, :created_at

  attribute :moderation_status do |object|
    ModerationStatus.where(moderatable_id: object.id, moderatable_type: object.moderatable_type).first&.status || 'unread'
  end
end