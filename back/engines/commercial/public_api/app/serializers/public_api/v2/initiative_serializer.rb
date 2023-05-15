# frozen_string_literal: true

class PublicApi::V2::InitiativeSerializer < ActiveModel::Serializer
  @@multiloc_service = MultilocService.new

  attributes :id,
    :title,
    :body,
    :author_id,
    :upvotes_count,
    :downvotes_count,
    :comments_count,
    :published_at,
    :publication_status,
    :created_at,
    :updated_at,
    :location_point, # TODO: Should we format this to just lat,long?
    :location_description,
    :slug,
    :official_feedbacks_count,
    :assignee_id,
    :assigned_at,
    :href,

  def title
    @@multiloc_service.t(object.title_multiloc)
  end

  def body
    @@multiloc_service.t(object.body_multiloc)
  end

  def href
    Frontend::UrlService.new.model_to_url object
  end
end
