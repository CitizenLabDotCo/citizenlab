class SideFxPhaseService

  include SideFxHelper

  def initialize sfx_pc=SideFxParticipationContextService.new
    @sfx_pc = sfx_pc
  end

  def before_create phase, user
    @sfx_pc.before_create phase, user
  end

  def after_create phase, user
    phase.update!(description_multiloc: TextImageService.new.swap_data_images(phase, :description_multiloc))
    LogActivityService.new.run(phase, 'created', user, phase.created_at.to_i)
    @sfx_pc.after_create phase, user
  end

  def before_update phase, user
    phase.description_multiloc = TextImageService.new.swap_data_images(phase, :description_multiloc)
    @sfx_pc.before_update phase, user
  end

  def after_update phase, user
    LogActivityService.new.run(phase, 'changed', user, phase.updated_at.to_i)
    @sfx_pc.after_update phase, user
  end

  def before_destroy phase, user
    @sfx_pc.before_destroy phase, user
  end

  def after_destroy frozen_phase, user
    serialized_phase = clean_time_attributes(frozen_phase.attributes)
    LogActivityService.new.run(
      encode_frozen_resource(frozen_phase), 'deleted',
      user, Time.now.to_i, 
      payload: {phase: serialized_phase}
    )
    @sfx_pc.after_destroy frozen_phase, user
  end

end
