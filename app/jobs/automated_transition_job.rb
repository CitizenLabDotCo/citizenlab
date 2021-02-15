class AutomatedTransitionJob < ApplicationJob
  queue_as :default

  def run
    return unless AppConfiguration.instance.has_feature? 'initiatives'

    InitiativeStatusService.new.automated_transitions!
  end
end
