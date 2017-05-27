class SideFxVoteService
  include SideFxHelper

  def after_create vote, current_user
    LogActivityJob.perform_later(vote, "#{vote.mode}voted", current_user, vote.created_at.to_i)
  end

  def after_destroy frozen_vote, current_user
    serialized_vote = clean_time_attributes(frozen_vote.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_vote), "canceled_#{frozen_vote.mode}vote", current_user, Time.now.to_i, payload: {vote: serialized_vote})
  end
end