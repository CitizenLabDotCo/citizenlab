class SideFxPhaseService

  include SideFxHelper

  def before_create phase, user
    phase.description_multiloc = TextImageService.new.swap_data_images(phase, :description_multiloc)
  end

  def after_create phase, user
    PermissionsService.new.create_permissions_for phase
    LogActivityJob.perform_later(phase, 'created', user, phase.created_at.to_i)
  end

  def before_update phase, user
    phase.description_multiloc = TextImageService.new.swap_data_images(phase, :description_multiloc)
  end

  def after_update phase, user
    PermissionsService.new.create_permissions_for phase
    LogActivityJob.perform_later(phase, 'changed', user, phase.updated_at.to_i)
  end

  def after_destroy frozen_phase, user
    serialized_phase = clean_time_attributes(frozen_phase.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_phase), 'deleted',
      user, Time.now.to_i, 
      payload: {phase: serialized_phase}
    )
  end

end
