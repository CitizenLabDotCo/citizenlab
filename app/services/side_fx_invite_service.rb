class SideFxInviteService

  include SideFxHelper

  def after_create invite, current_user
    # We need to identify a user with an ID in order to be able
    # to send him an email. We therefore make a temporary invited
    # user hash to mock the existance of a user.
    invited_user = {id: invite.token, email: invite.email}
    IdentifyToSegmentJob.perform_later(current_user, invited_user: invited_user)
    LogActivityJob.set(wait: 5.seconds).perform_later(invite, 'created', current_user, invite.created_at.to_i, user_id: invited_user[:id])
  end

  def after_accept frozen_invite, user 
    LogActivityJob.perform_later(encode_frozen_resource(frozen_invite), 'accepted', user, Time.now.to_i)
  end

end