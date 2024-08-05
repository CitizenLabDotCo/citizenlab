# frozen_string_literal: true

class WebApi::V1::IdeaStatusSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :color, :ordering, :code, :description_multiloc, :ideas_count, :participation_method

  attribute :can_transition_manually do |status|
    InputStatusService.new(status).can_transition_manually?
  end

  attribute :can_reorder do |status|
    InputStatusService.new(status).can_reorder?
  end
end
