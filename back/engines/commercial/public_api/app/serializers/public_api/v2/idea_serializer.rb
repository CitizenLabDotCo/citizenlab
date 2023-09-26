# frozen_string_literal: true

class PublicApi::V2::IdeaSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :title,
    :body,
    :author_id,
    :likes_count,
    :dislikes_count,
    :comments_count,
    :published_at,
    :publication_status,
    :project_id,
    :project_title,
    :created_at,
    :updated_at,
    :location_point, # Should we format this to just lat,long?
    :location_description,
    :slug,
    :budget,
    :baskets_count,
    :votes_count,
    :official_feedbacks_count,
    :assignee_id,
    :assigned_at,
    :proposed_budget,
    :creation_phase_id,
    :images, # Not in spec
    :href, # Not in spec
    :status, # idea_status in spec
    :custom_field_values, # Not nested in spec
    :type

  def title
    multiloc_service.t(object.title_multiloc)
  end

  def body
    multiloc_service.t(object.body_multiloc)
  end

  def images
    object.idea_images.map do |idea_image|
      idea_image.image.versions.to_h { |k, v| [k.to_s, v.url] }
    end
  end

  def project_title
    multiloc_service.t(object.project&.title_multiloc)
  end

  def status
    multiloc_service.t(object.idea_status&.title_multiloc)
  end

  def type
    object.project&.native_survey? || object.creation_phase_id.present? ? 'survey' : 'idea'
  end

  def href
    Frontend::UrlService.new.model_to_url object
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end
