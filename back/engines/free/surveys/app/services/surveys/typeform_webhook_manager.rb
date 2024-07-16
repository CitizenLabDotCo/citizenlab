# frozen_string_literal: true

require 'uri'

module Surveys
  class TypeformWebhookManager
    # @param [Typeform::Api] tf_api
    # @param [String] typeform_secret_token Token used to verify that requests
    #   are coming from Typeform.
    def initialize(tf_api = nil, typeform_secret_token = nil)
      @tf_api = tf_api || Typeform::Api.new(AppConfiguration.instance.settings('typeform_surveys', 'user_token'))
      @secret = typeform_secret_token || ENV.fetch('SECRET_TOKEN_TYPEFORM')
    end

    # Gets called every time the participation context (phase) changed wrt
    # participation_method or survey_embed_url
    #
    # @param [Phase] phase
    # @param [String] pm_from previous participation method
    # @param [String] pm_to new participation method
    # @param [String] service_from previous external survey service
    # @param [String] service_to new external survey service
    # @param [String] url_from previous form url
    # @param [String] url_to new form url
    def participation_context_changed(phase, pm_from, pm_to, service_from, service_to, url_from, url_to)
      return save_webhook(url_to, phase) if pm_to == 'survey' && service_to == 'typeform' && url_to
      return delete_webhook(url_from, phase.id) if pm_from == 'survey' && service_from == 'typeform'
    end

    def participation_context_created(phase, pm, service, url)
      save_webhook(url, phase) if pm == 'survey' && service == 'typeform' && url
    end

    def participation_context_to_be_deleted(phase_id, pm, service, url)
      delete_webhook(url, phase_id) if pm == 'survey' && service == 'typeform' && url
    end

    def delete_all_webhooks
      Phase.where(participation_method: 'survey', survey_service: 'typeform').each do |phase|
        delete_webhook(phase.survey_embed_url, phase.id)
      end
    end

    # Updates all webhooks
    # It is useful to update the url of all webhooks.
    def update_all_webhooks
      Phase.where(participation_method: 'survey', survey_service: 'typeform').each do |phase|
        save_webhook(phase.survey_embed_url, phase)
      end
    end

    private

    # Creates or updates a Typeform webhook
    def save_webhook(form_url, phase)
      response = @tf_api.create_or_update_webhook(
        form_id: embed_url_to_form_id(form_url),
        tag: phase.id,
        url: webhook_url(phase),
        secret: @secret
      )
      unless response.success?
        Rails.logger.error(
          'Failed to save typeform webhook',
          form_url: form_url,
          phase_id: phase.id,
          response: response.parsed_response
        )
      end
      response
    end

    def delete_webhook(form_url, webhook_id)
      @tf_api.delete_webhook(
        form_id: embed_url_to_form_id(form_url),
        tag: webhook_id
      )
    end

    # Extracts the form_id from the Typeform form url.
    def embed_url_to_form_id(embed_url)
      uri = URI(embed_url)
      uri.path.split('/').last
    end

    # @param [Phase] phase
    def webhook_url(phase)
      url_params = { pc_id: phase.id, pc_type: 'Phase' }
      "#{AppConfiguration.instance.base_backend_uri}/hooks/typeform_events?#{url_params.to_query}"
    end
  end
end
