# frozen_string_literal: true

class PublicApi::V2::GlobalTopicSerializer < PublicApi::V2::BaseSerializer
  type :global_topic

  attributes :id,
    :title,
    :description,
    :created_at,
    :updated_at

  def title
    multiloc_service.t(object.title_multiloc)
  end

  def description
    multiloc_service.t(object.description_multiloc)
  end

  private

  def multiloc_service
    @multiloc_service ||= MultilocService.new
  end
end
