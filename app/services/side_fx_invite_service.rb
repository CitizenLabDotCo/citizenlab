class SideFxInviteService

  include SideFxHelper

  def after_create invite, current_user
    IdentifyToSegmentJob.perform_later(invite.invitee)
    LogActivityJob.set(wait: 5.seconds).perform_later(invite, 'created', current_user, invite.created_at.to_i)
  end

  def after_accept invite 
    IdentifyToSegmentJob.perform_later(invite.invitee)
    LogActivityJob.perform_later(invite.invitee, 'completed signup', invite.invitee, invite.accepted_at.to_i)
    LogActivityJob.perform_later(invite, 'accepted', invite.invitee, invite.accepted_at.to_i)
  end

end