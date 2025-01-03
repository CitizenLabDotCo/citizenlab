# frozen_string_literal: true

class SideFxReactionService
  include SideFxHelper

  def after_create(reaction, current_user)
    InputStatusService.auto_transition_input!(reaction.reactable.reload) if reaction.reactable_type == 'Idea'

    if reaction.reactable_type == 'Initiative'
      AutomatedTransitionJob.perform_now

      lock_initiative_editing_if_required(reaction)
    end

    action = "#{reactable_type(reaction)}_#{reaction.mode == 'up' ? 'liked' : 'disliked'}"
    log_activity_job(reaction, action, current_user)
    create_followers reaction, current_user
  end

  def after_destroy(reaction, current_user)
    action = "canceled_#{reactable_type(reaction)}_#{reaction.mode == 'up' ? 'liked' : 'disliked'}"
    log_activity_job(reaction, action, current_user)
  end

  private

  def lock_initiative_editing_if_required(reaction)
    return if reaction.reactable.editing_locked || reaction.user_id == reaction.reactable.author_id

    reaction.reactable.update!(editing_locked: true)
  end

  def reactable_type(reaction)
    reaction.reactable_type.underscore
  end

  # We're always sending the encoded_frozen_resource for a reaction, even for
  # after_create where we normally send the vanilla resource. The reason is that
  # it's pretty common for likes/dislikes to be selected and them immediately
  # removed, leading to a race condition where the background job didn't execute
  # yet before deletion, and then errors because it can't load the reaction.
  # Because of this, we're always sending the frozen resource.
  def log_activity_job(reaction, action, current_user)
    serialized_reaction = clean_time_attributes(reaction.attributes)

    LogActivityJob.perform_later(
      encode_frozen_resource(reaction),
      action,
      current_user,
      Time.now.to_i,
      payload: { reaction: serialized_reaction },
      project_id: reaction.project_id
    )
  end

  def create_followers(reaction, user)
    post = case reaction.reactable_type
    when 'Comment'
      reaction.reactable.idea
    when 'Idea'
      reaction.reactable
    end
    return if !post.is_a? Idea

    Follower.find_or_create_by(followable: post.project, user: user)
    return if !post.project.in_folder?

    Follower.find_or_create_by(followable: post.project.folder, user: user)
  end
end
