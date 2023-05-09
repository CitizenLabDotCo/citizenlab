# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::ConsentsController < EmailCampaignsController
    before_action :set_consent, only: :update
    before_action :ensure_consents, only: %i[index update update_by_campaign_id]
    skip_before_action :authenticate_user

    def index
      authorize Consent

      @consents = policy_scope(Consent).where(user: current_user_by_unsubscription_token)
      @consents = paginate @consents

      render json: linked_json(@consents, WebApi::V1::ConsentSerializer, params: fastjson_params)
    end

    def update
      @consent.assign_attributes consent_params
      authorize @consent
      if @consent.save
        render json: WebApi::V1::ConsentSerializer.new(@consent, params: fastjson_params).serializable_hash.to_json, status: :ok
      else
        render json: { errors: @consent.errors.details }, status: :unprocessable_entity
      end
    end

    def update_by_campaign_id
      @campaign = Campaign.find(params[:campaign_id])
      @consent = Consent.find_by!(
        campaign_type: @campaign.type,
        user: current_user_by_unsubscription_token
      )
      update
    end

    def current_user_by_unsubscription_token
      token = UnsubscriptionToken.find_by(token: params[:unsubscription_token])
      if token
        token.user
      else
        current_user
      end
    end

    def pundit_user
      current_user_by_unsubscription_token
    end

    private

    def ensure_consents
      return unless current_user_by_unsubscription_token

      Consent.create_all_for_user!(current_user_by_unsubscription_token)
    end

    def set_consent
      @consent = Consent.find(params[:id])
      authorize @consent
    end

    def consent_params
      params.require(:consent).permit(
        :consented
      )
    end
  end
end
