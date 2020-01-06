class WebApi::V1::ModerationSerializer < WebApi::V1::BaseSerializer
  set_type :moderation

  attributes :moderatable_type, :content_title_multiloc, :content_body_multiloc, :content_slug, :created_at

  attribute :moderation_status do |object|
    ModerationStatus.where(moderatable_id: object.id, moderatable_type: object.moderatable_type).first&.status || 'unread'
  end

  attribute :belongs_to do |object, params|
    object.belongs_to preloaded: params[:preloaded]
  end
end