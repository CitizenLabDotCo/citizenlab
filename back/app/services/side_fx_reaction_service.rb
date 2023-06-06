# frozen_string_literal: true

class SideFxReactionService
  include SideFxHelper

  def before_create(reaction, current_user); end

  def after_create(reaction, current_user)
    if reaction.reactable_type == 'Initiative'
      AutomatedTransitionJob.perform_now
    end

    action = "#{reactable_type(reaction)}_#{reaction.mode}voted" # TODO: Action name
    log_activity_job(reaction, action, current_user)
  end

  def before_destroy(reaction, current_user); end

  def after_destroy(reaction, current_user)
    action = "canceled_#{reactable_type(reaction)}_#{reaction.mode}vote" # TODO: Action name
    log_activity_job(reaction, action, current_user)
  end

  private

  def reactable_type(reaction)
    reaction.reactable_type.underscore
  end

  def log_activity_job(reaction, action, current_user)
    serialized_reaction = clean_time_attributes(reaction.attributes)

    LogActivityJob.perform_later(
      encode_frozen_resource(reaction),
      action,
      current_user,
      Time.now.to_i,
      payload: { reaction: serialized_reaction }
    )
  end
end
