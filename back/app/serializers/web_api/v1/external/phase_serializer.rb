# frozen_string_literal: true

class WebApi::V1::External::PhaseSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :start_at, :end_at, :url, :participation_method, :project_title_multiloc

  def start_at
    object.start_date
  end

  def end_at
    object.end_date
  end

  def url
    Frontend::UrlService.new.model_to_url object
  end

  def project_title_multiloc
    object.project.title_multiloc
  end
end
