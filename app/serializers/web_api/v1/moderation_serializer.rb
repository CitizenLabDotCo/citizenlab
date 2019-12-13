class WebApi::V1::ModerationSerializer < WebApi::V1::BaseSerializer
  set_type :moderation

  attributes :moderatable_type, :context_slug, :context_type, :context_multiloc, :content_multiloc, :created_at

  attribute :moderation_status do |object|
    # Doesn't work
    # ModerationStatus.where(moderatable: object).first&.status || 'unread'
    ModerationStatus.where(moderatable_id: object.id, moderatable_type: object.moderatable_type).first&.status || 'unread'
  end

  attribute :context_url do |object|
    Frontend::UrlService.new.slug_to_url object.context_slug, object.context_type
  end
end