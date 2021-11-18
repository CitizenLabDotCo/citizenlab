class SideFxAdminPublicationService

  include SideFxHelper

  def after_update publication, user
    LogActivityService.new.run(publication, 'changed', user, publication.updated_at.to_i)
  end

end
