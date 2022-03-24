module Texting
  class WebApi::V1::CampaignsController < ApplicationController
    before_action :set_campaign, only: %i[show destroy update]
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    def index
      campaigns = policy_scope(Campaign).order(created_at: :desc)
      campaigns = paginate(campaigns)
      render json: linked_json(campaigns, WebApi::V1::CampaignSerializer, params: fastjson_params)
    end

    def show
      render json: WebApi::V1::CampaignSerializer.new(@campaign, params: fastjson_params).serialized_json
    end

    def create
      campaign = Texting::Campaign.new(campaign_params)

      authorize campaign
      if campaign.save
        SideFxCampaignService.new.after_create(campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          campaign,
          params: fastjson_params
        ).serialized_json, status: :created
      else
        render json: { errors: campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      @campaign.assign_attributes(campaign_params)
      authorize @campaign

      if @campaign.save
        SideFxCampaignService.new.after_update(@campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          @campaign,
          params: fastjson_params
        ).serialized_json, status: :ok
      else
        render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def destroy
      campaign = @campaign.destroy!
      SideFxCampaignService.new.after_destroy(campaign, current_user)
      head :ok
    end

    private

    def set_campaign
      @campaign = Campaign.find(params[:id])
      authorize @campaign
    end

    def campaign_params
      params.require(:campaign).permit(
        :message,
        phone_numbers: []
      )
    end
  end
end
