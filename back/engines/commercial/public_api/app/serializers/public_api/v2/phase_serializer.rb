# frozen_string_literal: true

class PublicApi::V2::PhaseSerializer < ActiveModel::Serializer
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
    :reacting_enabled,
    :reacting_like_method,
    :reacting_like_limited_max,
    :reacting_dislike_enabled,
    :reacting_dislike_method,
    :reacting_dislike_limited_max,
    :max_budget,
    :min_budget

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
