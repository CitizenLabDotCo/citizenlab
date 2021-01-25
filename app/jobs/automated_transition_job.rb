class AutomatedTransitionJob < ApplicationJob
  queue_as :default

  def run
    if Tenant.current.has_feature? 'initiatives'
      InitiativeStatusService.new.automated_transitions!
    end
  end

end
