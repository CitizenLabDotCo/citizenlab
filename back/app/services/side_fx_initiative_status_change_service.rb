# frozen_string_literal: true

class SideFxInitiativeStatusChangeService
  include SideFxHelper

  def before_create(change, user); end

  def after_create(change, user)
    lock_initiative_editing_if_required(change)

    InitiativeStatusService.new.log_status_change change, user: user

    if change.initiative_status.code == 'proposed'
      LogActivityJob.perform_later(change.initiative, 'proposed', user, change.created_at.to_i)
    end
  end

  private

  def lock_initiative_editing_if_required(change)
    return unless change.initiative_status.code == 'proposed' && Initiative.review_required?

    change.initiative.update!(editing_locked: true)
  end
end
