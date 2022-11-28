# frozen_string_literal: true

class SideFxVoteService
  include SideFxHelper

  def before_create(vote, current_user); end

  def after_create(vote, current_user)
    if vote.votable_type == 'Initiative'
      AutomatedTransitionJob.perform_now
    end

    action = "#{votable_type(vote)}_#{vote.mode}voted"
    log_activity_job(vote, action, current_user)
  end

  def before_destroy(vote, current_user); end

  def after_destroy(vote, current_user)
    action = "canceled_#{votable_type(vote)}_#{vote.mode}vote"
    log_activity_job(vote, action, current_user)
  end

  private

  def votable_type(vote)
    vote.votable_type.underscore
  end

  def log_activity_job(vote, action, current_user)
    serialized_vote = clean_time_attributes(vote.attributes)

    LogActivityJob.perform_later(
      encode_frozen_resource(vote),
      action,
      current_user,
      Time.now.to_i,
      payload: { vote: serialized_vote }
    )
  end
end
