# frozen_string_literal: true

class SideFxReactionService
  include SideFxHelper

  def before_create(vote, current_user); end

  def after_create(vote, current_user)
    if vote.reactable_type == 'Initiative'
      AutomatedTransitionJob.perform_now
    end

    action = "#{reactable_type(vote)}_#{vote.mode}voted"
    log_activity_job(vote, action, current_user)
  end

  def before_destroy(vote, current_user); end

  def after_destroy(vote, current_user)
    action = "canceled_#{reactable_type(vote)}_#{vote.mode}vote"
    log_activity_job(vote, action, current_user)
  end

  private

  def reactable_type(vote)
    vote.reactable_type.underscore
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
