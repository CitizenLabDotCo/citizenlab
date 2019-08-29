module Surveys
  class Hooks::TypeformEventsController < SurveysController

    CONSTANTIZER = {
      'Project' => {
        pc_class: Project
      },
      'Phase' => {
        pc_class: Phase
      }
    }

    skip_after_action :verify_policy_scoped
    skip_after_action :verify_authorized

    before_action :verify_signature, only: [:create]
    around_action :switch_tenant

    def create
      @participation_context = secure_constantize(:pc_class).find params[:pc_id]
      @response = TypeformWebhookParser.new.body_to_response(params)
      @response.participation_context = @participation_context
      if @response.save
        SideFxResponseService.new.after_create @response, @response.user
        head 200
      else
        render json: {errors: @response.errors.details}, status: :not_acceptable
      end
    end

    def secure_controller?
      false
    end

    private

    # adapted from https://developer.typeform.com/webhooks/secure-your-webhooks/
    def verify_signature
      received_signature = request.headers["HTTP_TYPEFORM_SIGNATURE"]
      payload_body = request.body.read
      hash = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), ENV.fetch('SECRET_TOKEN_TYPEFORM'), payload_body)
      actual_signature = 'sha256=' + Base64.strict_encode64(hash)
      unless Rack::Utils.secure_compare(actual_signature, received_signature)
        head :not_acceptable
      end
    end

    def switch_tenant
      tenant_id = params[:tenant_id]
      if tenant_id
        Apartment::Tenant.switch(Tenant.find(tenant_id).schema_name) do
          yield
        end
      else
        head :not_acceptable
      end
    rescue Apartment::TenantNotFound => e
      head :not_acceptable
    rescue ActiveRecord::RecordNotFound => e
      head :not_acceptable
    end

    def secure_constantize key
      CONSTANTIZER.fetch(params[:pc_type])[key]
    end

  end
end