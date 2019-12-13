class WebApi::V1::ModerationSerializer < WebApi::V1::BaseSerializer
  set_type :moderation

  attributes :moderatable_type, :context_slug, :context_type, :context_multiloc, :content_multiloc, :created_at, :moderation_status

  attribute :context_url do |object|
    Frontend::UrlService.new.slug_to_url object.context_slug, object.context_type
  end
end