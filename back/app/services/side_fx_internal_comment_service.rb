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

  def after_mark_as_deleted(comment, user)
    LogActivityJob.perform_later(
      comment,
      'marked_as_deleted',
      user,
      comment.updated_at.to_i
    )
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
    # comment.body_multiloc = comment.body_multiloc.to_h do |locale, body|
    #   new_body, _users = @@mention_service.process_mentions(body)
    #   [locale, new_body]
    # end
    comment.body_text, _users = MentionService.new.process_mentions(comment.body_text)
  end

  def notify_mentioned_users(comment, user)
    # mentioned_users = comment.body_multiloc.flat_map do |_locale, body|
    #   @@mention_service.extract_expanded_mention_users(body)
    # end
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
    # old_body_multiloc, new_body_multiloc = comment.body_multiloc_previous_change

    # mentioned_users = new_body_multiloc.flat_map do |locale, new_body|
    #   old_body = old_body_multiloc[locale] || ''
    #   @@mention_service.new_mentioned_users(old_body, new_body)
    # end

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
