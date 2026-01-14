# frozen_string_literal: true

class SideFxCommentService
  include SideFxHelper

  @@mention_service = MentionService.new

  def before_create(comment, user)
    check_participation_context(comment, user)
    process_mentions(comment)
  end

  def after_create(comment, user)
    LogActivityJob.perform_later(comment, 'created', user_for_activity_on_anonymizable_item(comment, user), comment.created_at.to_i)
    notify_mentioned_users(comment, user)
    create_followers(comment, user) unless comment.anonymous?
    enqueue_wise_voice_detection_job(comment)
  end

  def before_update(comment, _user)
    return unless comment.body_multiloc_changed?

    comment.body_updated_at = Time.now
    process_mentions(comment)
  end

  def after_update(comment, user)
    remove_user_from_past_activities_with_item(comment, user) if comment.anonymous_previously_changed?(to: true)

    LogActivityJob.perform_later(comment, 'changed', user_for_activity_on_anonymizable_item(comment, user), comment.updated_at.to_i)

    return unless comment.body_multiloc_previously_changed?

    enqueue_wise_voice_detection_job(comment)
    LogActivityJob.perform_later(comment, 'changed_body', user_for_activity_on_anonymizable_item(comment, user), comment.body_updated_at.to_i, payload: { change: comment.body_multiloc_previous_change })
    notify_updated_mentioned_users(comment, user)
  end

  def after_mark_as_deleted(comment, user, reason_code, other_reason)
    LogActivityJob.perform_later(
      comment,
      'marked_as_deleted',
      user,
      comment.updated_at.to_i,
      payload: { reason_code: reason_code, other_reason: other_reason }
    )
  end

  def before_destroy(comment, user); end

  def after_destroy(frozen_comment, user)
    ParticipantsService.new.clear_project_participants_count_cache(frozen_comment.idea.project)

    serialized_comment = clean_time_attributes(frozen_comment.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_comment), 'deleted', user, Time.now.to_i, payload: { comment: serialized_comment })
  end

  private

  def check_participation_context(comment, user)
    disallowed_reason = Permissions::IdeaPermissionsService.new(comment.idea, user).denied_reason_for_action('commenting_idea')
    return unless disallowed_reason

    raise ClErrors::TransactionError.new(error_key: disallowed_reason)
  end

  def process_mentions(comment)
    comment.body_multiloc = comment.body_multiloc.to_h do |locale, body|
      new_body, _users = @@mention_service.process_mentions(body)
      [locale, new_body]
    end
  end

  def notify_mentioned_users(comment, user)
    mentioned_users = comment.body_multiloc.flat_map do |_locale, body|
      @@mention_service.extract_expanded_mention_users(body)
    end

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(comment, 'mentioned', user_for_activity_on_anonymizable_item(comment, user), comment.created_at.to_i, payload: { mentioned_user: mentioned_user.id })
    end
  end

  def notify_updated_mentioned_users(comment, user)
    old_body_multiloc, new_body_multiloc = comment.body_multiloc_previous_change
    mentioned_users = new_body_multiloc.flat_map do |locale, new_body|
      old_body = old_body_multiloc[locale] || ''
      @@mention_service.new_mentioned_users(old_body, new_body)
    end

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(comment, 'mentioned', user_for_activity_on_anonymizable_item(comment, user), comment.created_at.to_i, payload: { mentioned_user: mentioned_user.id })
    end
  end

  def create_followers(comment, user)
    Follower.find_or_create_by(followable: comment.idea, user: user)

    Follower.find_or_create_by(followable: comment.idea.project, user: user)
    return if !comment.idea.project.in_folder?

    Follower.find_or_create_by(followable: comment.idea.project.folder, user: user)
  end

  def enqueue_wise_voice_detection_job(comment)
    return if !AppConfiguration.instance.feature_activated?('idea_feed')

    WiseVoiceDetectionJob.perform_later(comment)
  end
end

SideFxCommentService.prepend(FlagInappropriateContent::Patches::SideFxCommentService)
