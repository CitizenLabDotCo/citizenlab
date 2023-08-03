# frozen_string_literal: true

class SideFxInitiativeStatusChangeService
  include SideFxHelper

  def before_create(change, user); end

  def after_create(change, user)
    voting_period_if_required(change)
    lock_initiative_editing_if_required(change)

    InitiativeStatusService.new.log_status_change change, user: user
  end

  private

  def lock_initiative_editing_if_required(change)
    return unless change.initiative_status.code == 'proposed' && Initiative.review_required?

    change.initiative.update!(editing_locked: true)
  end

  def voting_period_if_required(change)
    return unless change.initiative_status.code == 'proposed'

    change.initiative.update!(voting_started_at: Time.zone.now)
  end
end
