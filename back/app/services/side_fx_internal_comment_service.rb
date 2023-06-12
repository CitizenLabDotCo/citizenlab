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
    return unless comment.body_text_changed?

    comment.body_updated_at = Time.now
    process_mentions(comment)
  end

  def after_update(comment, user)
    LogActivityJob.perform_later(comment, 'changed', user, comment.updated_at.to_i)

    return unless comment.body_text_previously_changed?

    LogActivityJob.perform_later(
      comment,
      'changed_body',
      user,
      comment.body_updated_at.to_i,
      payload: { change: comment.body_text_previous_change }
    )
    notify_updated_mentioned_users(comment, user)
  end

  def before_destroy(comment, user); end

  def after_destroy(frozen_comment, user)
    serialized_comment = clean_time_attributes(frozen_comment.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_comment),
      'deleted',
      user, Time.now.to_i,
      payload: { comment: serialized_comment }
    )
  end

  private

  def process_mentions(comment)
    comment.body_text, _users = MentionService.new.process_mentions(comment.body_text)
  end

  def notify_mentioned_users(comment, user)
    mentioned_users = MentionService.new.extract_expanded_mention_users(comment.body_text)

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
    old_body_text, new_body_text = comment.body_text_previous_change
    mentioned_users = MentionService.new.new_mentioned_users(old_body_text, new_body_text)

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
