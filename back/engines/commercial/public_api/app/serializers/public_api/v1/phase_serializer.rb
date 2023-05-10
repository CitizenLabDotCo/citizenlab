# frozen_string_literal: true

class PublicApi::V1::PhaseSerializer < ActiveModel::Serializer

  @@multiloc_service = MultilocService.new

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
    :posting_enabled,
    :commenting_enabled,
    :voting_enabled,
    :upvoting_method,
    :upvoting_limited_max,
    :downvoting_enabled,
    :downvoting_method,
    :downvoting_limited_max,
    :max_budget,
    :min_budget

  def title
    @@multiloc_service.t(object.title_multiloc)
  end

  def description
    @@multiloc_service.t(object.description_multiloc)
  end

  def project_title
    @@multiloc_service.t(object.project.title_multiloc)
  end
end
