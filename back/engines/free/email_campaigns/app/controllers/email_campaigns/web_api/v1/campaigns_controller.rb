module EmailCampaigns
  class WebApi::V1::CampaignsController < EmailCampaignsController

    before_action :set_campaign, only: [:show, :update, :do_send, :send_preview, :preview, :deliveries, :stats, :destroy]
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    def index
      @campaigns = policy_scope(Campaign)
        .order(created_at: :desc)

      if params[:campaign_names]
        campaign_types = params[:campaign_names].map{|name| Campaign.from_campaign_name(name) }
        @campaigns = @campaigns.where(type: campaign_types)
      end

      if params[:without_campaign_names]
        campaign_types = params[:without_campaign_names].map{|name| Campaign.from_campaign_name(name) }
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

    def create
      @campaign = EmailCampaigns::DeliveryService.campaign_classes.select do |claz|
        claz.campaign_name == params[:campaign][:campaign_name]
      end.first.new(campaign_params)
      @campaign.author ||= current_user

      authorize @campaign
      SideFxCampaignService.new.before_create(@campaign, current_user)
      if @campaign.save
        SideFxCampaignService.new.after_create(@campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          @campaign,
          params: fastjson_params
          ).serialized_json, status: :created
      else
        render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      params[:campaign][:group_ids] ||= [] if params[:campaign].has_key?(:group_ids)

      saved = nil
      ActiveRecord::Base.transaction do
        @campaign.assign_attributes(campaign_params)
        authorize @campaign

        SideFxCampaignService.new.before_update(@campaign, current_user)

        saved = @campaign.save
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

    def destroy
      SideFxCampaignService.new.before_destroy(@campaign, current_user)
      campaign = @campaign.destroy
      if campaign.destroyed?
        SideFxCampaignService.new.after_destroy(campaign, current_user)
        head :ok
      else
        head 500
      end
    end

    def do_send
      if @campaign.valid?
        SideFxCampaignService.new.before_send(@campaign, current_user)
        EmailCampaigns::DeliveryService.new.send_now(@campaign)
        SideFxCampaignService.new.after_send(@campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          @campaign.reload,
          params: fastjson_params
          ).serialized_json
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
      render json: {html: html}
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
      params.require(:campaign).permit(
        :enabled,
        :sender,
        :reply_to,
        group_ids: [],
        subject_multiloc: I18n.available_locales,
        body_multiloc: I18n.available_locales,
      )
    end

    def user_not_authorized exception
      if %w(create? update? destroy? do_send? send_preview? deliveries? stats?).include? exception.query
        if !current_user.admin? && current_user.project_moderator?
          render json: { errors: { group_ids: [{ error: 'unauthorized_choice_moderator' }] } }, status: :unauthorized
        else
          render json: { errors: { base: [{ error: 'unauthorized' }] } }, status: :unauthorized
        end
      end
    end
  end
end
