module EmailCampaigns
  class WebApi::V1::CampaignsController < EmailCampaignsController

    before_action :set_campaign, only: [:show, :update, :do_send, :destroy]
    def index
      @campaigns = policy_scope(Campaign)
        .order(sent_at: :desc)
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      @campaigns = @campaigns.order(created_at: :desc)
      render json: @campaigns
    end

    def show
      render json: @campaign
    end

    def create
      @campaign = Campaign.new(campaign_params)
      @campaign.author ||= current_user

      authorize @campaign

      SideFxCampaignService.new.before_create(@campaign, current_user)
      if @campaign.save
        SideFxCampaignService.new.after_create(@campaign, current_user)
        render json: @campaign, status: :created
      else
        render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      @campaign.assign_attributes(campaign_params)

      SideFxCampaignService.new.before_update(@campaign, current_user)

      if @campaign.save
        SideFxCampaignService.new.after_update(@campaign, current_user)
        render json: @campaign, status: :ok
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
      SendCampaignJob.perform_later(@campaign)
      @campaign.update(sent_at: Time.now)
      render json: @campaign
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
        subject_multiloc: I18n.available_locales,
        body_multiloc: I18n.available_locales,
      )
    end
  end
end
