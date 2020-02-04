class SideFxProjectHolderOrderingService

  include SideFxHelper

  def after_update pho, user
    LogActivityJob.perform_later(pho, 'changed', user, pho.updated_at.to_i)
  end

end
