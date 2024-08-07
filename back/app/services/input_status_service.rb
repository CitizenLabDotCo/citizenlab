# frozen_string_literal: true

class InputStatusService
  AUTOMATED_TRANSITIONS = {
    'proposed' => {
      :threshold_reached => 'threshold_reached',
      :expired => 'expired',
    }
  }
  attr_reader :input_status

  def initialize(input_status)
    @input_status = input_status
  end

  AUTOMATED_TRANSITIONS = {
    'proposed' => [
      'threshold_reached',
      'expired'
    ]
  }

  def self.automated_transitions!
    AUTOMATED_TRANSITIONS.each do |code_from, transitions|
      inputs_from = Idea.published.includes(:idea_status).where(idea_status: { code: code_from })
      transitions.each do |code_to|
        inputs_to = case code_to
        when 'threshold_reached'
          filter_threshold_reached(inputs_from)
        when 'expired'
          filter_expired_scope(inputs_from)
        else
          inputs_from.none
        end
        inputs_to.each do |input|
          status_to = IdeaStatus.find_by(code: code_to, participation_method: input.participation_method_on_creation.class.method_str)
          input.update!(idea_status: status_to)
          LogActivityJob.perform_later(
            input,
            'changed_input_status',
            nil,
            Time.zone.now.to_i,
            payload: { input_status_from_code: code_from, input_status_to_code: code_to }
          )
        end
      end
    end
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

  private

  private_class_method def self.filter_threshold_reached(inputs_from)
    inputs_to = inputs_from.none
    ConsultationContext.grouped_inputs(inputs_from).each do |consultation_context, inputs|
      next if !consultation_context.supports_automated_statuses?

      inputs_to = inputs_to.or(inputs.where('likes_count >= ?', consultation_context.reacting_threshold))
    end
    inputs_to
  end

  private_class_method def self.filter_expired_scope(inputs_from)
    inputs_from.none
  end
end
