# frozen_string_literal: true

class SideFxPhaseService
  include SideFxHelper

  attr_writer :permissions_update_service

  def before_create(phase, user); end

  def after_create(phase, user)
    phase.update!(description_multiloc: TextImageService.new.swap_data_images_multiloc(phase.description_multiloc, field: :description_multiloc, imageable: phase))
    LogActivityJob.perform_later(
      phase,
      'created',
      user,
      phase.created_at.to_i,
      payload: { phase: clean_time_attributes(phase.attributes) }
    )

    permissions_update_service.update_permissions_for_scope(phase)

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

    if phase.pmethod.allowed_ideas_orders.exclude? phase.ideas_order
      phase.ideas_order = phase.pmethod.allowed_ideas_orders.first
    end
  end

  def after_update(phase, user)
    change = phase.saved_changes
    payload = { phase: clean_time_attributes(phase.attributes) }
    payload[:change] = sanitize_change(change) if change.present?

    LogActivityJob.perform_later(
      phase,
      'changed',
      user,
      phase.updated_at.to_i,
      payload: payload
    )

    permissions_update_service.update_permissions_for_scope(phase)

    %i[
      description_multiloc voting_method voting_max_votes_per_idea voting_max_total voting_min_total
      submission_enabled commenting_enabled reacting_enabled
      reacting_like_method reacting_like_limited_max reacting_dislike_enabled presentation_mode participation_method
      autoshare_results_enabled manual_voters_amount survey_popup_frequency
    ].each do |attribute|
      if phase.send :"#{attribute}_previously_changed?"
        LogActivityJob.perform_later(
          phase,
          "changed_#{attribute}",
          user,
          phase.updated_at.to_i,
          payload: { change: phase.send(:"#{attribute}_previous_change") }
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
      payload: { phase: serialized_phase },
      project_id: frozen_phase&.project&.id
    )
  end

  def before_delete_inputs(phase, user); end

  def after_delete_inputs(phase, user)
    LogActivityJob.perform_later phase, 'inputs_deleted', user, Time.now.to_i
  end

  private

  def permissions_update_service
    @permissions_update_service ||= Permissions::PermissionsUpdateService.new
  end
end
