# frozen_string_literal: true

class SideFxPhaseService
  include SideFxHelper

  def initialize(sfx_pc = SideFxParticipationContextService.new)
    @sfx_pc = sfx_pc
  end

  def before_create(phase, user)
    @sfx_pc.before_create phase, user
  end

  def after_create(phase, user)
    participation_method = Factory.instance.participation_method_for(phase)
    participation_method.create_default_form! if participation_method.auto_create_default_form?
    phase.update!(description_multiloc: TextImageService.new.swap_data_images(phase, :description_multiloc))
    LogActivityJob.perform_later(phase, 'created', user, phase.created_at.to_i)
    @sfx_pc.after_create phase, user
  end

  def before_update(phase, user)
    phase.description_multiloc = TextImageService.new.swap_data_images(phase, :description_multiloc)
    @sfx_pc.before_update phase, user
  end

  def after_update(phase, user)
    LogActivityJob.perform_later(phase, 'changed', user, phase.updated_at.to_i)
    @sfx_pc.after_update phase, user
  end

  def before_destroy(phase, user)
    @sfx_pc.before_destroy phase, user
  end

  def after_destroy(frozen_phase, user)
    serialized_phase = clean_time_attributes(frozen_phase.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_phase), 'deleted',
      user, Time.now.to_i,
      payload: { phase: serialized_phase }
    )
    @sfx_pc.after_destroy frozen_phase, user
  end

  def before_delete_inputs(phase, user); end

  def after_delete_inputs(phase, user)
    LogActivityJob.perform_later phase, 'inputs_deleted', user, Time.now.to_i
  end
end
