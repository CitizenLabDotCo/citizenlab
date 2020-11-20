class SideFxInviteService

  include SideFxHelper

  def after_create invite, current_user
    LogActivityJob.set(wait: 5.seconds).perform_later(invite, 'created', current_user, invite.created_at.to_i)
  end

  def before_accept invite
    invite.accepted_at = Time.now
    if CustomField.with_resource_type('User').enabled.count == 0
      invite.invitee.registration_completed_at ||= invite.accepted_at
    end
  end

  def after_accept invite
    TrackUserJob.perform_later(invite.invitee)
    LogActivityJob.perform_later(invite, 'accepted', invite.invitee, invite.accepted_at.to_i)
    if invite.invitee&.registration_completed_at
      LogActivityJob.perform_later(invite.invitee, 'completed_registration', invite.invitee, invite.accepted_at.to_i)
    end
    UpdateMemberCountJob.perform_later
  end

  def after_destroy frozen_invite, user
    serialized_invite = clean_time_attributes(frozen_invite.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_invite), 'deleted', user, Time.now.to_i, payload: {invite: serialized_invite})
  end

end
