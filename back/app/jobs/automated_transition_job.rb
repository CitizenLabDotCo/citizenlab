# frozen_string_literal: true

class AutomatedTransitionJob < ApplicationJob
  queue_as :default

  def run
    InputStatusService.auto_transition_hourly!

    return unless AppConfiguration.instance.feature_activated? 'initiatives'

    InitiativeStatusService.new.automated_transitions!
  end
end
