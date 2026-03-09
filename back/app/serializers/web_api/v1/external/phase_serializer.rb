# frozen_string_literal: true

class WebApi::V1::External::PhaseSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :url, :participation_method, :project_title_multiloc

  attribute :start_at, &:start_date
  attribute :end_at, &:end_date

  def url
    Frontend::UrlService.new.model_to_url object
  end

  def project_title_multiloc
    object.project.title_multiloc
  end
end
