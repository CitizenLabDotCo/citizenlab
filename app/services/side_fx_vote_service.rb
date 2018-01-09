class SideFxVoteService
  include SideFxHelper

  def before_create vote, current_user
    check_participation_context(vote, vote.user)
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



  private


  def check_participation_context vote, user
    pcs = ParticipationContextService.new

    project = vote.votable&.project
    if project
      disallowed_reason = pcs.voting_disabled_reason(project, user)
      if disallowed_reason
        raise ClErrors::TransactionError.new(error_key: disallowed_reason)
      end
    end
  end

  def votable_type vote
    vote.votable_type.underscore
  end
end