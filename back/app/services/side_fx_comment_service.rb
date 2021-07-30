class SideFxCommentService

  include SideFxHelper

  @@mention_service = MentionService.new

  def before_create comment, user
    check_participation_context(comment, user)
    process_mentions(comment)
  end

  def after_create comment, user
    LogActivityJob.perform_later(comment, 'created', user, comment.created_at.to_i)
    notify_mentioned_users(comment, user)
  end

  def before_update comment, user
    if comment.body_multiloc_changed?
      comment.body_updated_at = Time.now
      process_mentions(comment)
    end
  end

  def after_update comment, user
    LogActivityJob.perform_later(comment, 'changed', user, comment.updated_at.to_i)
    if comment.body_multiloc_previously_changed?
      LogActivityJob.perform_later(comment, 'changed_body', user, comment.body_updated_at.to_i, payload: {change: comment.body_multiloc_previous_change})
      notify_updated_mentioned_users(comment, user)
    end
  end

  def after_mark_as_deleted comment, user, reason_code, other_reason
    LogActivityJob.perform_later(comment, 'marked_as_deleted', user, comment.updated_at.to_i, 
      payload: {reason_code: reason_code, other_reason: other_reason})
  end

  def before_destroy comment, user

  end

  def after_destroy frozen_comment, user
    serialized_comment = clean_time_attributes(frozen_comment.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_comment), 'deleted', user, Time.now.to_i, payload: {comment: serialized_comment})
  end



  private

  def check_participation_context comment, user
    pcs = ParticipationContextService.new
    idea = comment.post if comment.post_type == 'Idea'
    if idea
      disallowed_reason = pcs.commenting_disabled_reason_for_idea(idea, user)
      if disallowed_reason
        raise ClErrors::TransactionError.new(error_key: disallowed_reason)
      end
    end
  end

  def process_mentions comment
    comment.body_multiloc = comment.body_multiloc.map do |locale, body|
      new_body, users = @@mention_service.process_mentions(body)
      [locale, new_body]
    end.to_h
  end

  def notify_mentioned_users comment, user
    mentioned_users = comment.body_multiloc.flat_map do |locale, body|
      @@mention_service.extract_expanded_mention_users(body)
    end

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(comment, 'mentioned', user, comment.created_at.to_i, payload: {mentioned_user: mentioned_user.id})
    end
  end

  def notify_updated_mentioned_users comment, user
    old_body_multiloc, new_body_multiloc = comment.body_multiloc_previous_change
    mentioned_users = new_body_multiloc.flat_map do |locale, new_body|
      old_body = old_body_multiloc[locale] || ""
      @@mention_service.new_mentioned_users(old_body, new_body)
    end

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(comment, 'mentioned', user, comment.created_at.to_i, payload: {mentioned_user: mentioned_user.id})
    end
  end

end

::SideFxCommentService.prepend_if_ee('FlagInappropriateContent::Patches::SideFxCommentService')
