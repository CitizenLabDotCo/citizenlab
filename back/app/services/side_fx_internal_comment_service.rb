# frozen_string_literal: true

class SideFxInternalCommentService
  include SideFxHelper

  def before_create(comment, _user)
    process_mentions(comment)
  end

  def after_create(comment, user)
    LogActivityJob.perform_later(comment, 'created', user, comment.created_at.to_i)
    notify_mentioned_users(comment, user)
  end

  def before_update(comment, _user)
    return unless comment.body_changed?

    comment.body_updated_at = Time.now
    process_mentions(comment)
  end

  def after_update(comment, user)
    LogActivityJob.perform_later(comment, 'changed', user, comment.updated_at.to_i)

    return unless comment.body_previously_changed?

    LogActivityJob.perform_later(
      comment,
      'changed_body',
      user,
      comment.body_updated_at.to_i,
      payload: { change: comment.body_previous_change }
    )
    notify_updated_mentioned_users(comment, user)
  end

  def after_mark_as_deleted(comment, user)
    LogActivityJob.perform_later(
      comment,
      'marked_as_deleted',
      user,
      comment.updated_at.to_i
    )
  end

  private

  def process_mentions(comment)
    comment.body, _users = MentionService.new.process_mentions(comment.body)
  end

  def notify_mentioned_users(comment, user)
    mentioned_users = MentionService.new.extract_expanded_mention_users(comment.body)

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(
        comment,
        'mentioned',
        user,
        comment.created_at.to_i,
        payload: { mentioned_user: mentioned_user.id }
      )
    end
  end

  def notify_updated_mentioned_users(comment, user)
    old_body, new_body = comment.body_previous_change
    mentioned_users = MentionService.new.new_mentioned_users(old_body, new_body)

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(
        comment,
        'mentioned',
        user,
        comment.created_at.to_i,
        payload: { mentioned_user: mentioned_user.id }
      )
    end
  end
end
