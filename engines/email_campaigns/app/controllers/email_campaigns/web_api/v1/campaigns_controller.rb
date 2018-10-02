module EmailCampaigns
  class WebApi::V1::CampaignsController < EmailCampaignsController

    before_action :set_campaign, only: [:show, :update, :do_send, :send_preview, :preview, :deliveries, :stats, :destroy]
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    def index
      @campaigns = policy_scope(Campaign)
        .order(created_at: :desc)
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))

      if params[:campaign_names]
        campaign_types = params[:campaign_names].map{|name| Campaign.from_campaign_name(name) }
        @campaigns = @campaigns.where(type: campaign_types)
      end

      if params[:without_campaign_names]
        campaign_types = params[:without_campaign_names].map{|name| Campaign.from_campaign_name(name) }
        @campaigns = @campaigns.where.not(type: campaign_types)
      end

      render json: @campaigns, each_serializer: WebApi::V1::CampaignSerializer
    end

    def show
      render json: @campaign, serializer: WebApi::V1::CampaignSerializer
    end

    def create
      campaign_claz = Campaign.from_campaign_name(params[:campaign][:campaign_name]).constantize
      @campaign = campaign_claz.new(campaign_params)
      @campaign.author ||= current_user

      authorize @campaign

      SideFxCampaignService.new.before_create(@campaign, current_user)
      if @campaign.save
        SideFxCampaignService.new.after_create(@campaign, current_user)
        render json: @campaign, status: :created, serializer: WebApi::V1::CampaignSerializer
      else
        render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      params[:campaign][:group_ids] ||= [] if params[:campaign].has_key?(:group_ids)

      ActiveRecord::Base.transaction do
        @campaign.assign_attributes(campaign_params)
        authorize @campaign

        SideFxCampaignService.new.before_update(@campaign, current_user)

        if @campaign.save
          SideFxCampaignService.new.after_update(@campaign, current_user)
          render json: @campaign, status: :ok, serializer: WebApi::V1::CampaignSerializer
        else
          render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
        end
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
      EmailCampaigns::DeliveryService.new.send_now(@campaign)
      render json: @campaign.reload, serializer: WebApi::V1::CampaignSerializer
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
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      render json: @deliveries, include: [:user]
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
