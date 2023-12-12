# frozen_string_literal: true

class SideFxPhaseService
  include SideFxHelper

  attr_writer :permissions_service

  def before_create(phase, user); end

  def after_create(phase, user)
    participation_method = Factory.instance.participation_method_for(phase)
    participation_method.create_default_form! if participation_method.auto_create_default_form?
    phase.update!(description_multiloc: TextImageService.new.swap_data_images_multiloc(phase.description_multiloc, field: :description_multiloc, imageable: phase))
    LogActivityJob.perform_later(phase, 'created', user, phase.created_at.to_i)

    permissions_service.update_permissions_for_scope(phase)

    Surveys::WebhookManagerJob.perform_later(
      'participation_context_created',
      phase,
      phase.participation_method,
      phase.survey_service,
      phase.survey_embed_url
    )
  end

  def before_update(phase, _user)
    phase.description_multiloc = TextImageService.new.swap_data_images_multiloc(phase.description_multiloc, field: :description_multiloc, imageable: phase)

    method = Factory.instance.participation_method_for phase
    if method.allowed_ideas_orders.exclude? phase.ideas_order
      phase.ideas_order = method.allowed_ideas_orders.first
    end
  end

  def after_update(phase, user)
    LogActivityJob.perform_later(phase, 'changed', user, phase.updated_at.to_i)

    permissions_service.update_permissions_for_scope(phase)

    %i[
      description_multiloc voting_method voting_max_votes_per_idea voting_max_total voting_min_total
      posting_enabled posting_method posting_limited_max commenting_enabled reacting_enabled
      reacting_like_method reacting_like_limited_max reacting_dislike_enabled presentation_mode
    ].each do |attribute|
      if phase.send "#{attribute}_previously_changed?"
        LogActivityJob.perform_later(
          phase,
          "changed_#{attribute}",
          user,
          phase.updated_at.to_i,
          payload: { change: phase.send("#{attribute}_previous_change") }
        )
      end
    end

    Surveys::WebhookManagerJob.perform_later(
      'participation_context_changed',
      phase,
      phase.participation_method_previous_change&.dig(0) || phase.participation_method,
      phase.participation_method,
      phase.survey_service_previous_change&.dig(0) || phase.survey_service,
      phase.survey_service,
      phase.survey_embed_url_previous_change&.dig(0) || phase.survey_embed_url,
      phase.survey_embed_url
    )
  end

  def before_destroy(phase, _user)
    Surveys::WebhookManagerJob.perform_later(
      'participation_context_to_be_deleted',
      phase.id,
      phase.participation_method,
      phase.survey_service,
      phase.survey_embed_url
    )
  end

  def after_destroy(frozen_phase, user)
    serialized_phase = clean_time_attributes(frozen_phase.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_phase), 'deleted',
      user, Time.now.to_i,
      payload: { phase: serialized_phase }
    )
  end

  def before_delete_inputs(phase, user); end

  def after_delete_inputs(phase, user)
    LogActivityJob.perform_later phase, 'inputs_deleted', user, Time.now.to_i
  end

  private

  def permissions_service
    @permissions_service ||= PermissionsService.new
  end
end
