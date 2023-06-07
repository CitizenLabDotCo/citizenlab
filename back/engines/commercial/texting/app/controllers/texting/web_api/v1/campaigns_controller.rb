# frozen_string_literal: true

module Texting
  class WebApi::V1::CampaignsController < ApplicationController
    before_action :set_campaign, only: %i[show destroy update do_send]
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    # custom authentication
    skip_before_action :authenticate_user, only: :mark_as_sent
    skip_after_action :verify_authorized, only: :mark_as_sent

    def index
      campaigns = policy_scope(Campaign).order(created_at: :desc)
      campaigns = paginate(campaigns)
      render json: linked_json(campaigns, WebApi::V1::CampaignSerializer, params: jsonapi_serializer_params)
    end

    def show
      render json: WebApi::V1::CampaignSerializer.new(@campaign, params: jsonapi_serializer_params).serializable_hash
    end

    def create
      campaign = Texting::Campaign.new(campaign_params)

      authorize campaign
      if campaign.save
        SideFxCampaignService.new.after_create(campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          campaign,
          params: jsonapi_serializer_params
        ).serializable_hash, status: :created
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
          params: jsonapi_serializer_params
        ).serializable_hash, status: :ok
      else
        render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def destroy
      campaign = @campaign.destroy!
      SideFxCampaignService.new.after_destroy(campaign, current_user)
      head :ok
    end

    def do_send
      segments_limit = AppConfiguration.instance.settings('texting', 'monthly_sms_segments_limit')
      if Texting::Sms.provider.exeeds_queue_limit?(@campaign.segments_count)
        render json: { errors: { base: [{ error: :too_many_total_segments }] } }, status: :unprocessable_entity
      elsif segments_limit && Campaign.this_month_segments_count + @campaign.segments_count > segments_limit
        render json: { errors: { base: [{ error: :monthly_limit_reached }] } }, status: :unprocessable_entity
      else
        @campaign.update!(status: Texting::Campaign.statuses.fetch(:sending))
        SendCampaignJob.perform_later(@campaign)
        SideFxCampaignService.new.after_send(@campaign, current_user)
        head :ok
      end
    end

    # SMS provider calls it
    def mark_as_sent
      campaign = Campaign.find(params[:id])
      url = Texting::WebhookUrlGenerator.new.mark_campaign_as_sent(campaign)
      if Texting::Sms.provider.request_valid?(url, request)
        campaign.update!(status: Texting::Campaign.statuses.fetch(:sent), sent_at: Time.zone.now) if campaign.sending?
        head :ok
      else
        head :unauthorized
      end
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
