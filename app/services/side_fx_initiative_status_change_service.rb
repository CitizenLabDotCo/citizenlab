class SideFxInitiativeStatusChangeService
  include SideFxHelper

  def before_create change, user
  end

  def after_create change, user
    InitiativeStatusService.new.log_status_change change, user: user
  end

end
