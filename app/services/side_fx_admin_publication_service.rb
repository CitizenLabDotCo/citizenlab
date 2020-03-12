class SideFxAdminPublicationService

  include SideFxHelper

  def after_update publication, user
    LogActivityJob.perform_later(publication, 'changed', user, publication.updated_at.to_i)
  end

end
