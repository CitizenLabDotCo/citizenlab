# frozen_string_literal: true

class WebApi::V1::InputTopicSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :ordering, :icon

  belongs_to :project
end
