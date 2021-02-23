class AutomatedTransitionJob < ApplicationJob
  queue_as :default

  def run
    return unless AppConfiguration.instance.feature_activated? 'initiatives'

    InitiativeStatusService.new.automated_transitions!
  end
end
