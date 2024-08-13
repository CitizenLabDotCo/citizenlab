# frozen_string_literal: true

class InputStatusService
  attr_reader :input_status

  def initialize(input_status)
    @input_status = input_status
  end

  def can_transition_manually?
    case input_status.participation_method
    when 'ideation'
      true
    when 'proposals'
      !input_status.automatic?
    else
      false
    end
  end

  def can_reorder?
    !input_status.automatic?
  end
end
