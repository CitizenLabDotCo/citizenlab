module EmailCampaigns
  class WebApi::V1::ConsentsController < EmailCampaignsController

    before_action :set_consent, only: [:update]

    def index
      Consent.create_all_for_user!(User.find(params[:user_id]))
      
      @consents = policy_scope(Consent)
        .where(user_id: params[:user_id])
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))

      render json: linked_json(@consents, WebApi::V1::ConsentSerializer, params: fastjson_params)
    end

    def update
      @consent.assign_attributes consent_params
      authorize @consent
      if @consent.save
        render json: WebApi::V1::ConsentSerializer.new(@consent, params: fastjson_params).serialized_json, status: :ok
      else
        render json: { errors: @consent.errors.details }, status: :unprocessable_entity
      end
    end

    private

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
