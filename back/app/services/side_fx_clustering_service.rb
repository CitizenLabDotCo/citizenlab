class SideFxClusteringService
  include SideFxHelper

  def before_create clustering, user

  end

  def after_create clustering, user
    LogActivityJob.perform_later(clustering, 'created', user, clustering.created_at.to_i)
  end

  def before_update clustering, user
    
  end

  def after_update clustering, user
    LogActivityJob.perform_later(clustering, 'changed', user, clustering.updated_at.to_i)
  end

  def before_destroy clustering, user

  end

  def after_destroy frozen_clustering, user
    serialized_clustering = clean_time_attributes(frozen_clustering.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_clustering), 'deleted', user, Time.now.to_i, payload: {clustering: serialized_clustering})
  end

end