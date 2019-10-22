class AutomatedTransitionJob < ApplicationJob
  queue_as :default

  def perform
    InitiativeStatusService.new.automated_transitions!
  end

end
