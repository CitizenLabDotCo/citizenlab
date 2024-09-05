# frozen_string_literal: true

class WebApi::V1::IdeaStatusSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :color, :ordering, :code, :description_multiloc, :ideas_count, :participation_method

  attribute :locked do |status|
    status.locked?
  end

  attribute :can_manually_transition_to do |status|
    status.can_manually_transition_to?
  end
end
