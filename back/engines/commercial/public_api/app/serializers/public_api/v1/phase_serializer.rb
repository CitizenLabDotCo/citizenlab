# frozen_string_literal: true

class PublicApi::V1::PhaseSerializer < ActiveModel::Serializer
  attributes :id, :title

  attribute :start_at, &:start_date
  attribute :end_at, &:end_date

  def title
    multiloc_service.t(object.title_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end
