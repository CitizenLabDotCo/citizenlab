# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::SmsConsentsController < EmailCampaignsController
    before_action :set_consent, only: :update
    before_action :ensure_consents, only: %i[index update]

    def index
      authorize SmsConsent

      @consents = policy_scope(SmsConsent).where(user: current_user)
      @consents = paginate @consents

      render json: linked_json(@consents, WebApi::V1::SmsConsentSerializer, params: jsonapi_serializer_params)
    end

    def update
      @consent.assign_attributes consent_params
      authorize @consent
      if @consent.save
        render json: WebApi::V1::SmsConsentSerializer.new(@consent, params: jsonapi_serializer_params).serializable_hash, status: :ok
      else
        render json: { errors: @consent.errors.details }, status: :unprocessable_entity
      end
    end

    private

    def ensure_consents
      return unless current_user

      SmsConsent.create_all_for_user!(current_user)
    end

    def set_consent
      @consent = SmsConsent.find(params[:id])
      authorize @consent
    end

    def consent_params
      params.require(:consent).permit(:consented)
    end
  end
end
