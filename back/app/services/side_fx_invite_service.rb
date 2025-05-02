# frozen_string_literal: true

class SideFxInviteService
  include SideFxHelper

  def after_create(invite, current_user)
    LogActivityJob.set(wait: 5.seconds).perform_later(invite, 'created', current_user, invite.created_at.to_i)
  end

  def before_accept(invite)
    invite.accepted_at = Time.now
    return unless AppConfiguration.instance.feature_activated?('user_confirmation')

    invite.invitee.email_confirmed_at ||= invite.accepted_at
  end

  def after_accept(invite)
    if invite.invitee.registration_completed_at_previously_changed?
      LogActivityJob.perform_later(invite.invitee, 'completed_registration', invite.invitee, invite.invitee.updated_at.to_i)
    end

    TrackUserJob.perform_later(invite.invitee)
    LogActivityJob.perform_later(invite, 'accepted', invite.invitee, invite.accepted_at.to_i)
    UpdateMemberCountJob.perform_later
  end

  def after_destroy(frozen_invite, user)
    serialized_invite = clean_time_attributes(frozen_invite.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_invite), 'deleted', user, Time.now.to_i, payload: { invite: serialized_invite })
  end
end
