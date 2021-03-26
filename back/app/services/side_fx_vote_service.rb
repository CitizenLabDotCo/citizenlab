class SideFxVoteService
  include SideFxHelper

  def before_create vote, current_user

  end

  def after_create vote, current_user
    if vote.votable_type == 'Initiative'
      AutomatedTransitionJob.perform_now
    end
    type = votable_type(vote)
    LogActivityJob.perform_later(vote, "#{type}_#{vote.mode}voted", current_user, vote.created_at.to_i)
  end

  def before_destroy vote, current_user

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


  private

  def votable_type vote
    vote.votable_type.underscore
  end

end