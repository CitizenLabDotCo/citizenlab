module Surveys

  class TypeformWebhookManager

    def initialize tf_api=Typeform::Api.new(Tenant.settings('typeform_surveys','user_token'))
      @tf_api = tf_api
    end

    # Gets called every time the participation context changed wrt
    # participation_method or survey_embed_url

    def participation_context_changed pc, pm_from, pm_to, service_from, service_to, url_from, url_to
      if pm_to == 'survey' && service_to == 'typeform' && url_to
        @tf_api.create_or_update_webhook(
          form_id: embed_url_to_form_id(url_to),
          tag: pc.id,
          url: tenant_to_webhook_url(Tenant.current, pc),
          secret: ENV.fetch("SECRET_TOKEN_TYPEFORM")
        )
      elsif pm_from == 'survey' && service_from == 'typeform'
        @tf_api.delete_webhook(
          form_id: embed_url_to_form_id(url_from),
          tag: pc.id,
        )
      end
    end

    def participation_context_created pc, pm, service, url
      if pm == 'survey' && service == 'typeform' && url
        @tf_api.create_or_update_webhook(
          form_id: embed_url_to_form_id(url),
          tag: pc.id,
          url: tenant_to_webhook_url(Tenant.current, pc),
          secret: ENV.fetch("SECRET_TOKEN_TYPEFORM")
        )
      end
    end

    def participation_context_to_be_deleted pc_id, pm, service, url
      if pm == 'survey' && service == 'typeform' && url
        @tf_api.delete_webhook(
          form_id: embed_url_to_form_id(url),
          tag: pc_id,
        )
      end
    end

    def tenant_to_be_destroyed tenant
      [Project.is_participation_context, Phase].each do |claz|
        claz.where(participation_method: 'survey', survey_service: 'typeform').each do |pc|
          @tf_api.delete_webhook(
            form_id: embed_url_to_form_id(pc.survey_embed_url),
            tag: pc.id
          )
        end
      end
    end

    private

    def embed_url_to_form_id embed_url
      embed_url.split('/').last
    end

    def tenant_to_webhook_url tenant, pc
      url_params = {
        tenant_id: tenant.id,
        pc_id: pc.id,
        pc_type: pc.class.name
      }
      "http://#{ENV.fetch('CLUSTER_HOST')}/hooks/typeform_events?#{url_params.to_query}"
    end

  end
end