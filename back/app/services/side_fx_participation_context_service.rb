# frozen_string_literal: true

class SideFxParticipationContextService
  include SideFxHelper

  attr_writer :permissions_service

  def before_create(context, user); end

  def after_create(context, _user)
    permissions_service.update_permissions_for_scope(context)
    Surveys::WebhookManagerJob.perform_later(
      'participation_context_created',
      context,
      context.participation_method,
      context.survey_service,
      context.survey_embed_url
    )
  end

  def before_update(context, _user)
    method = Factory.instance.participation_method_for context
    if method.allowed_ideas_orders.exclude? context.ideas_order
      context.ideas_order = method.allowed_ideas_orders.first
    end
  end

  def after_update(context, user)
    permissions_service.update_permissions_for_scope(context)
    %i[
      description_multiloc voting_method voting_max_votes_per_idea voting_max_total voting_min_total
      posting_enabled posting_method posting_limited_max commenting_enabled reacting_enabled
      reacting_like_method reacting_like_limited_max reacting_dislike_enabled presentation_mode
    ].each do |attribute|
      if context.send "#{attribute}_previously_changed?"
        LogActivityJob.perform_later(
          context,
          "changed_#{attribute}",
          user,
          context.updated_at.to_i,
          payload: { change: context.send("#{attribute}_previous_change") }
        )
      end
    end

    Surveys::WebhookManagerJob.perform_later(
      'participation_context_changed',
      context,
      context.participation_method_previous_change&.dig(0) || context.participation_method,
      context.participation_method,
      context.survey_service_previous_change&.dig(0) || context.survey_service,
      context.survey_service,
      context.survey_embed_url_previous_change&.dig(0) || context.survey_embed_url,
      context.survey_embed_url
    )
  end

  def before_destroy(context, _user)
    Surveys::WebhookManagerJob.perform_later(
      'participation_context_to_be_deleted',
      context.id,
      context.participation_method,
      context.survey_service,
      context.survey_embed_url
    )
  end

  def after_destroy(frozen_context, user); end

  private

  def permissions_service
    @permissions_service ||= PermissionsService.new
  end
end
