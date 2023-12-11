# frozen_string_literal: true

module Surveys
  class Hooks::TypeformEventsController < SurveysController
    skip_before_action :authenticate_user
    skip_after_action :verify_policy_scoped
    skip_after_action :verify_authorized

    before_action :verify_signature, only: [:create]

    def create
      @phase = Phase.find params[:pc_id]
      @response = TypeformWebhookParser.new.body_to_response(params)
      @response.phase = @phase
      if @response.save
        SideFxResponseService.new.after_create @response, @response.user
        head :ok
      else
        render json: { errors: @response.errors.details }, status: :not_acceptable
      end
    end

    private

    # adapted from https://developer.typeform.com/webhooks/secure-your-webhooks/
    def verify_signature
      received_signature = request.headers['HTTP_TYPEFORM_SIGNATURE']
      payload_body = request.body.read
      hash = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), ENV.fetch('SECRET_TOKEN_TYPEFORM'), payload_body)
      encoding = Base64.strict_encode64(hash)
      actual_signature = "sha256=#{encoding}"
      head :not_acceptable unless Rack::Utils.secure_compare(actual_signature, received_signature)
    end
  end
end
