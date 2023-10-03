# frozen_string_literal: true

class SideFxParticipationContextService
  include SideFxHelper

  def before_create(pc, user); end

  def after_create(pc, _user)
    Surveys::WebhookManagerJob.perform_later(
      'participation_context_created',
      pc,
      pc.participation_method,
      pc.survey_service,
      pc.survey_embed_url
    )
  end

  def before_update(pc, _user)
    method = Factory.instance.participation_method_for pc
    if method.allowed_ideas_orders.exclude? pc.ideas_order
      pc.ideas_order = method.allowed_ideas_orders.first
    end
  end

  def after_update(pc, user)
    %i[
      description_multiloc voting_method voting_max_votes_per_idea voting_max_total voting_min_total
      posting_enabled posting_method posting_limited_max commenting_enabled reacting_enabled
      reacting_like_method reacting_like_limited_max reacting_dislike_enabled presentation_mode
    ].each do |attribute|
      if pc.send "#{attribute}_previously_changed?"
        LogActivityJob.perform_later(
          pc,
          "changed_#{attribute}",
          user,
          pc.updated_at.to_i,
          payload: { change: pc.send("#{attribute}_previous_change") }
        )
      end
    end

    Surveys::WebhookManagerJob.perform_later(
      'participation_context_changed',
      pc,
      pc.participation_method_previous_change&.dig(0) || pc.participation_method,
      pc.participation_method,
      pc.survey_service_previous_change&.dig(0) || pc.survey_service,
      pc.survey_service,
      pc.survey_embed_url_previous_change&.dig(0) || pc.survey_embed_url,
      pc.survey_embed_url
    )
  end

  def before_destroy(pc, _user)
    Surveys::WebhookManagerJob.perform_later(
      'participation_context_to_be_deleted',
      pc.id,
      pc.participation_method,
      pc.survey_service,
      pc.survey_embed_url
    )
  end

  def after_destroy(frozen_pc, user); end
end

SideFxParticipationContextService.prepend(GranularPermissions::Patches::SideFxParticipationContextService)
