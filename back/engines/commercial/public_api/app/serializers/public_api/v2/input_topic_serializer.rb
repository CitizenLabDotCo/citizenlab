# frozen_string_literal: true

class PublicApi::V2::InputTopicSerializer < PublicApi::V2::BaseSerializer
  type :input_topic

  attributes :id,
    :project_id,
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
end
