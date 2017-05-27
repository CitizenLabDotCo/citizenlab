class SideFxCommentService

  include SideFxHelper

  def after_create comment, user
    LogActivityJob.perform_later(comment, 'created', user, comment.created_at.to_i)
  end

  def after_update comment, user
    if comment.body_multiloc_previously_changed?
      LogActivityJob.perform_later(comment, 'changed', user, comment.updated_at.to_i)
    end

  end

  def after_destroy frozen_comment, user
    serialized_comment = clean_time_attributes(frozen_comment.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_comment), 'deleted', user, Time.now.to_i, payload: {comment: serialized_comment})
  end

end