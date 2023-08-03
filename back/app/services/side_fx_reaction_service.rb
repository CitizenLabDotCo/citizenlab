# frozen_string_literal: true

class SideFxReactionService
  include SideFxHelper

  def before_create(reaction, current_user); end

  def after_create(reaction, current_user)
    if reaction.reactable_type == 'Initiative'
      AutomatedTransitionJob.perform_now
    end

    action = "#{reactable_type(reaction)}_#{reaction.mode == 'up' ? 'liked' : 'disliked'}" # TODO: Action name
    log_activity_job(reaction, action, current_user)
    create_followers reaction, current_user
  end

  def before_destroy(reaction, current_user); end

  def after_destroy(reaction, current_user)
    action = "canceled_#{reactable_type(reaction)}_#{reaction.mode == 'up' ? 'liked' : 'disliked'}" # TODO: Action name
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

  def create_followers(reaction, user)
    Follower.find_or_create_by(followable: reaction.reactable, user: user)
    return if reaction.reactable_type != 'Idea'

    Follower.find_or_create_by(followable: reaction.reactable.project, user: user)
    return if !reaction.reactable.project.in_folder?

    Follower.find_or_create_by(followable: reaction.reactable.project.folder, user: user)
  end
end
