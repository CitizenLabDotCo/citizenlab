# frozen_string_literal: true

class PublicApi::V2::PhaseSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :title,
    :description,
    :participation_method,
    :project_id,
    :project_title,
    :start_at,
    :end_at,
    :created_at,
    :updated_at,
    :ideas_count,
    :baskets_count,
    :votes_count,
    :posting_enabled,
    :commenting_enabled,
    :reacting_enabled,
    :reacting_like_method,
    :reacting_like_limited_max,
    :reacting_dislike_enabled,
    :reacting_dislike_method,
    :reacting_dislike_limited_max,
    :voting_max_total,
    :voting_min_total

  def title
    multiloc_service.t(object.title_multiloc)
  end

  def description
    multiloc_service.t(object.description_multiloc)
  end

  def project_title
    multiloc_service.t(object.project.title_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end
