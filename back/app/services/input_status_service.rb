# frozen_string_literal: true

class InputStatusService
  AUTOMATED_TRANSITIONS = {
    'proposed' => %w[threshold_reached expired]
  }

  attr_reader :input_status

  def initialize(input_status)
    @input_status = input_status
  end

  def self.auto_transition_input!(input)
    AUTOMATED_TRANSITIONS[input.idea_status.code]&.each do |code_to|
      can_transition = case code_to
      when 'threshold_reached'
        threshold_reached_condition?(input)
      else
        false
      end

      apply_transition!(input, code_to) if can_transition
    end
  end

  def self.auto_transition_hourly!
    AUTOMATED_TRANSITIONS&.each do |code_from, codes_to|
      inputs = Idea.includes(:idea_status).where(idea_status: { code: code_from })
      codes_to.each do |code_to|
        inputs_to_transition = case code_to
        when 'expired'
          expired_scope(inputs)
        else
          inputs.none
        end

        inputs_to_transition.each do |input|
          apply_transition!(input, code_to)
        end
      end
    end
  end

  private

  private_class_method def self.apply_transition!(input, code_to)
    code_from = input.idea_status.code
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

  private_class_method def self.threshold_reached_condition?(input)
    threshold = input.consultation_context.try(:reacting_threshold)
    threshold && input.likes_count >= threshold
  end

  private_class_method def self.expired_scope(inputs, now = Time.zone.now)
    # This code assumes that the consultation context corresponds to
    # the creation phase, which is not yet the case for ideation.
    inputs
      .includes(:creation_phase)
      .where.not(creation_phase: { expire_days_limit: nil })
      .where("published_at + creation_phase.expire_days_limit * interval '1 day' < ?", now)
  end
end
