class SideFxOfficialFeedbackService
  include SideFxHelper

  @@mention_service = MentionService.new

  def before_create feedback, user
    process_mentions feedback
  end

  def after_create feedback, user
    LogActivityJob.perform_later(feedback, 'created', user, feedback.created_at.to_i)
    notify_mentioned_users feedback, user
  end

  def before_update feedback, user
    process_mentions(feedback) if feedback.body_multiloc_changed?
  end

  def after_update feedback, user
    LogActivityJob.perform_later(feedback, 'changed', user, feedback.updated_at.to_i)
    notify_updated_mentioned_users(feedback, user) if feedback.body_multiloc_previously_changed?
  end

  def before_destroy feedback, user

  end

  def after_destroy frozen_feedback, user
    serialized_feedback = clean_time_attributes(frozen_feedback.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_feedback), 'deleted', user, Time.now.to_i, payload: {official_feedback: serialized_feedback})
  end


  private

  def process_mentions feedback
    feedback.body_multiloc = feedback.body_multiloc.map do |locale, body|
      new_body, users = @@mention_service.process_mentions(body)
      [locale, new_body]
    end.to_h
  end

  def notify_mentioned_users feedback, user
    mentioned_users = feedback.body_multiloc.flat_map do |locale, body|
      @@mention_service.extract_expanded_mention_users(body)
    end

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(feedback, 'mentioned', user, feedback.created_at.to_i, payload: {mentioned_user: mentioned_user.id})
    end
  end

  def notify_updated_mentioned_users feedback, user
    old_body_multiloc, new_body_multiloc = feedback.body_multiloc_previous_change
    mentioned_users = new_body_multiloc.flat_map do |locale, new_body|
      old_body = old_body_multiloc[locale] || ""
      @@mention_service.new_mentioned_users(old_body, new_body)
    end

    mentioned_users.uniq.each do |mentioned_user|
      LogActivityJob.perform_later(feedback, 'mentioned', user, feedback.created_at.to_i, payload: {mentioned_user: mentioned_user.id})
    end
  end

end