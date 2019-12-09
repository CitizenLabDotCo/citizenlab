class WebApi::V1::ModerationSerializer < WebApi::V1::BaseSerializer
  set_type :moderation

  attributes :moderatable_type, :context_slug, :context_type, :context_multiloc, :content_multiloc, :created_at
end