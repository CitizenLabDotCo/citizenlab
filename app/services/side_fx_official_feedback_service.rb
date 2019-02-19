class SideFxOfficialFeedbackService
  include SideFxHelper

  def before_create feedback, user

  end

  def after_create feedback, user
    LogActivityJob.perform_later(feedback, 'created', user, feedback.created_at.to_i)
  end

  def before_update feedback, user

  end

  def after_update feedback, user
    LogActivityJob.perform_later(feedback, 'changed', user, feedback.updated_at.to_i)
  end

  def before_destroy feedback, user

  end

  def after_destroy frozen_feedback, user
    serialized_feedback = clean_time_attributes(frozen_feedback.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_feedback), 'deleted', user, Time.now.to_i, payload: {official_feedback: serialized_feedback})
  end

end