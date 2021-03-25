class SideFxTaggingService
  include SideFxHelper

  def before_create tagging, user
  end

  def after_create tagging, user
    LogActivityJob.perform_later(tagging, 'created', user, tagging.created_at.to_i)
  end

  # def before_update tagging, user
  # end
  #
  # def after_update tagging, user
  # end

  def before_destroy tagging, user
  end

  def after_destroy frozen_tagging, user

    Tagging::Tag.find(frozen_tagging.tag_id).destroy! if Tagging::Tagging.where(tag_id: frozen_tagging.tag_id).empty?

    serialized_tagging = clean_time_attributes(frozen_tagging.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_tagging), 'deleted', user, Time.now.to_i, payload: {tagging: serialized_tagging})
  end

end
