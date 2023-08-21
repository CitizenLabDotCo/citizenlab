# frozen_string_literal: true

class SideFxInitiativeStatusChangeService
  include SideFxHelper

  def before_create(change, user); end

  def after_create(change, user)
    InitiativeStatusService.new.log_status_change change, user: user

    # Behaviour we want when proposal review feature is on and initiative_status_change is to 'proposed':
    #   * Create an Initiative 'proposed' activity type, to trigger the InitiativePublished campaign.
    #   * Lock (prevent) editing of the initiative.
    # This works because, if the review feature is off, the associated initiative_status_change with code 'proposed'
    # is created at the model level when the initiative is published, and does not invoke this method.
    if change.initiative_status.code == 'proposed'
      SideFxInitiativeService.new.log_initiative_proposed_activity(change.initiative, user)
      change.initiative.update!(editing_locked: true)
    end
  end
end
