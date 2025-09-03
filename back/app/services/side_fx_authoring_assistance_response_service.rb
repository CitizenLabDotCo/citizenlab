class SideFxAuthoringAssistanceResponseService
  include SideFxHelper

  def after_create(response, user)
    LogActivityJob.perform_later(response, 'created', user, response.created_at.to_i)
  end
end
