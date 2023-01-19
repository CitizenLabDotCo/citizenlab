# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::CampaignsController < EmailCampaignsController
    before_action :set_campaign, only: %i[show update send_preview preview deliveries stats]
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    def index
      @campaigns = policy_scope(Campaign)
        .order(created_at: :desc)

      if params[:campaign_names]
        campaign_types = params[:campaign_names].map { |name| Campaign.from_campaign_name(name) }
        @campaigns = @campaigns.where(type: campaign_types)
      end

      if params[:without_campaign_names]
        campaign_types = params[:without_campaign_names].map { |name| Campaign.from_campaign_name(name) }
        @campaigns = @campaigns.where.not(type: campaign_types)
      end

      @campaigns = @campaigns
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      render json: linked_json(@campaigns, WebApi::V1::CampaignSerializer, params: fastjson_params)
    end

    def show
      render json: WebApi::V1::CampaignSerializer.new(@campaign, params: fastjson_params).serialized_json
    end

    def update
      params[:campaign][:group_ids] ||= [] if params[:campaign].key?(:group_ids)

      saved = ActiveRecord::Base.transaction do
        @campaign.assign_attributes(campaign_params)
        authorize @campaign

        SideFxCampaignService.new.before_update(@campaign, current_user)
        @campaign.save
      end

      if saved
        SideFxCampaignService.new.after_update(@campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          @campaign,
          params: fastjson_params
        ).serialized_json, status: :ok
      else
        render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def send_preview
      EmailCampaigns::DeliveryService.new.send_preview(@campaign, current_user)
      head :ok
    end

    def preview
      html = EmailCampaigns::DeliveryService.new.preview_html(@campaign, current_user)
      render json: { html: html }
    end

    def deliveries
      @deliveries = @campaign.deliveries
        .includes(:user)
        .order(:created_at)
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      render json: linked_json(
        @deliveries,
        WebApi::V1::DeliverySerializer,
        params: fastjson_params,
        include: [:user]
      )
    end

    def stats
      render json: EmailCampaigns::Delivery.status_counts(@campaign.id)
    end

    private

    def set_campaign
      @campaign = Campaign.find(params[:id])
      authorize @campaign
    end

    def campaign_params
      params.require(:campaign).permit(:enabled)
    end

    def user_not_authorized(exception)
      return unless %w[update? send_preview? deliveries? stats?].include? exception.query

      if !current_user.admin? && current_user.project_moderator?
        render json: { errors: { group_ids: [{ error: 'unauthorized_choice_moderator' }] } }, status: :unauthorized
      else
        render json: { errors: { base: [{ error: 'unauthorized' }] } }, status: :unauthorized
      end
    end
  end
end
