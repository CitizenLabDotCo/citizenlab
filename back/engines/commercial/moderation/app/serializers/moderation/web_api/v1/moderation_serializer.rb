# frozen_string_literal: true

module Moderation
  class WebApi::V1::ModerationSerializer < ::WebApi::V1::BaseSerializer
    set_type :moderation

    attributes :moderatable_type, :content_title_multiloc, :content_body_multiloc, :content_slug, :created_at

    attribute :belongs_to do |object|
      case object.moderatable_type
      when 'Idea'
        { project: { id: object.project_id, slug: object.project_slug, title_multiloc: object.project_title_multiloc } }
      when 'Comment'
        { project: { id: object.project_id, slug: object.project_slug, title_multiloc: object.project_title_multiloc }, object.post_type.underscore.to_sym => { id: object.post_id, slug: object.post_slug, title_multiloc: object.post_title_multiloc } }
      end
    end

    attribute :moderation_status do |object|
      object.moderation_status&.status || 'unread'
    end
  end
end

Moderation::WebApi::V1::ModerationSerializer.include(FlagInappropriateContent::Extensions::WebApi::V1::ModerationSerializer)
