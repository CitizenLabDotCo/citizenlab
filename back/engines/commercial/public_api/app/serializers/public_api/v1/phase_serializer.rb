# frozen_string_literal: true

class PublicApi::V1::PhaseSerializer < ActiveModel::Serializer
  attributes :id,
    :title,
    :start_at,
    :end_at

  def title
    multiloc_service.t(object.title_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end
