# frozen_string_literal: true

class WebApi::V1::IdeaStatusSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :color, :ordering, :code, :description_multiloc, :ideas_count

  attribute :can_reorder do |status| # TODO: Reuse logic
    case status.participation_method
    when 'ideation'
      status.code != 'proposed'
    when 'proposals'
      %w[proposed threshold_reached expired].exlcude? status.code
    else
      false
    end
  end

  attribute :can_transition_manually do |status| # TODO: Reuse logic
    case status.participation_method
    when 'ideation'
      true
    when 'proposals'
      %w[proposed threshold_reached expired].exlcude? status.code
    else
      false
    end
  end
end
