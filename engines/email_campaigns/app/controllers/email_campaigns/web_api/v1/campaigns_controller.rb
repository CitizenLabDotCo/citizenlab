module EmailCampaigns
  class WebApi::V1::CampaignsController < EmailCampaignsController

    before_action :set_campaign, only: [:show, :update, :do_send, :send_preview, :preview, :deliveries, :stats, :destroy]

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

      @campaign.assign_attributes(campaign_params)

      SideFxCampaignService.new.before_update(@campaign, current_user)

      if @campaign.save
        SideFxCampaignService.new.after_update(@campaign, current_user)
        render json: @campaign, status: :ok, serializer: WebApi::V1::CampaignSerializer
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
      @campaign.update(
        sent_at: Time.now,
        campaigns_recipients: @campaign.calculated_recipients.map do |recipient|
          CampaignsRecipient.new(
            delivery_status: 'sent',
            user_id: recipient.id,
            campaign_id: @campaign.id
          )
        end
      )
      SendCampaignJob.perform_later(@campaign)
      render json: @campaign
    end

    def send_preview
      CampaignMailer.campaign_mail(@campaign, current_user).deliver_later
      head :ok
    end

    def preview
      mail = CampaignMailer.campaign_mail(@campaign, current_user)
      html = mail.parts[1].body.to_s
      render json: {html: html}
    end

    def deliveries
      @deliveries = @campaign.deliveries
        .includes(:user)
        .page(params.dig(:page, :number))
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
        :sender,
        :reply_to,
        group_ids: [],
        subject_multiloc: I18n.available_locales,
        body_multiloc: I18n.available_locales,
      )
    end
  end
end
