module EmailCampaigns
  class WebApi::V1::ManualCampaignsController < EmailCampaignsController

    before_action :set_campaign, only: [:show, :update, :do_send, :send_preview, :preview, :recipients, :stats, :destroy]
    def index
      @manual_campaigns = policy_scope(ManualCampaign)
        .order(sent_at: :desc)
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      @manual_campaigns = @manual_campaigns.order(created_at: :desc)
      render json: @manual_campaigns
    end

    def show
      render json: @manual_campaign
    end

    def create
      @manual_campaign = ManualCampaign.new(manual_campaign_params)
      @manual_campaign.author ||= current_user

      authorize @manual_campaign

      SideFxManualCampaignService.new.before_create(@manual_campaign, current_user)
      if @manual_campaign.save
        SideFxManualCampaignService.new.after_create(@manual_campaign, current_user)
        render json: @manual_campaign, status: :created
      else
        render json: { errors: @manual_campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      params[:manual_campaign][:group_ids] ||= [] if params[:manual_campaign].has_key?(:group_ids)

      @manual_campaign.assign_attributes(manual_campaign_params)

      SideFxManualCampaignService.new.before_update(@manual_campaign, current_user)

      if @manual_campaign.save
        SideFxManualCampaignService.new.after_update(@manual_campaign, current_user)
        render json: @manual_campaign, status: :ok
      else
        render json: { errors: @manual_campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def destroy
      SideFxManualCampaignService.new.before_destroy(@manual_campaign, current_user)
      campaign = @manual_campaign.destroy
      if campaign.destroyed?
        SideFxManualCampaignService.new.after_destroy(campaign, current_user)
        head :ok
      else
        head 500
      end
    end

    def do_send
      @manual_campaign.update(
        sent_at: Time.now,
        campaigns_recipients: @manual_campaign.calculated_recipients.map do |recipient|
          ManualCampaignsRecipient.new(
            delivery_status: 'sent',
            user_id: recipient.id,
            campaign_id: @manual_campaign.id
          )
        end
      )
      SendCampaignJob.perform_later(@manual_campaign)
      render json: @manual_campaign
    end

    def send_preview
      ManualCampaignMailer.campaign_mail(@manual_campaign, current_user).deliver_later
      head :ok
    end

    def preview
      mail = ManualCampaignMailer.campaign_mail(@manual_campaign, current_user)
      html = mail.parts[1].body.to_s
      render json: {html: html}
    end

    def recipients
      @recipients = @manual_campaign.manual_campaigns_recipients
        .includes(:user)
        .page(params.dig(:page, :number))
      render json: @recipients, include: [:user]
    end

    def stats
      render json: ManualCampaignsRecipient.status_counts(@manual_campaign.id)
    end 

    private

    def set_campaign
      @manual_campaign = ManualCampaign.find(params[:id])
      authorize @manual_campaign
    end

    def manual_campaign_params
      params.require(:manual_campaign).permit(
        :sender,
        :reply_to,
        group_ids: [],
        subject_multiloc: I18n.available_locales,
        body_multiloc: I18n.available_locales,
      )
    end
  end
end
