class SideFxInitiativeStatusChangeService
  include SideFxHelper

  def before_create change, user
  end

  def after_create change, user
    LogActivityJob.perform_later(change.initiative, 'changed_status', user, change.created_at.to_i)
  end

end
