# frozen_string_literal: true

class PublicApi::V1::PhaseSerializer < ActiveModel::Serializer
  attributes :id, :title

  def start_at
    object.start_date
  end

  def end_at
    object.end_date
  end

  def title
    multiloc_service.t(object.title_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end
