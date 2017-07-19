class SideFxVoteService
  include SideFxHelper

  def votable_type vote
    vote.votable_type.underscore
  end

  def after_create vote, current_user
    type = votable_type(vote)
    LogActivityJob.perform_later(vote, "#{type}_#{vote.mode}voted", current_user, vote.created_at.to_i)
  end

  def after_destroy frozen_vote, current_user
    serialized_vote = clean_time_attributes(frozen_vote.attributes)
    type = votable_type(frozen_vote)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_vote), 
      "canceled_#{type}_#{frozen_vote.mode}vote", 
      current_user, 
      Time.now.to_i, 
      payload: {vote: serialized_vote}
    )
  end
end