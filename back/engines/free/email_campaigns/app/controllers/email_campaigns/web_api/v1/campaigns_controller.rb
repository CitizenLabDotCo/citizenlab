# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::CampaignsController < EmailCampaignsController
    before_action :set_campaign, only: %i[show update do_send send_preview preview deliveries stats destroy]

    def index
      @campaigns = policy_scope(Campaign)
        .order(created_at: :desc)

      if params[:without_campaign_names]
        campaign_types = params[:without_campaign_names].map { |name| Campaign.from_campaign_name(name) }
        @campaigns = @campaigns.where.not(type: campaign_types)
      end

      @campaigns = @campaigns.where(context: campaign_context) if campaign_context

      @campaigns = parse_bool(params[:manual]) ? @campaigns.manual : @campaigns.automatic if params[:manual]

      @campaigns = @campaigns
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      render json: linked_json(@campaigns, WebApi::V1::CampaignSerializer, params: jsonapi_serializer_params)
    end

    def show
      render json: WebApi::V1::CampaignSerializer.new(@campaign, params: jsonapi_serializer_params).serializable_hash
    end

    def create
      @campaign = EmailCampaigns::DeliveryService.new.campaign_classes.find do |claz|
        claz.campaign_name == params[:campaign][:campaign_name]
      end.new(campaign_params)
      @campaign.author ||= current_user

      authorize @campaign
      SideFxCampaignService.new.before_create(@campaign, current_user)
      if @campaign.save
        SideFxCampaignService.new.after_create(@campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          @campaign,
          params: jsonapi_serializer_params
        ).serializable_hash, status: :created
      else
        render json: { errors: @campaign.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      params[:campaign][:group_ids] ||= [] if params[:campaign].key?(:group_ids)

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
          params: jsonapi_serializer_params
        ).serializable_hash, status: :ok
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
        head :internal_server_error
      end
    end

    def do_send
      if @campaign.valid?(:send)
        SideFxCampaignService.new.before_send(@campaign, current_user)
        EmailCampaigns::DeliveryService.new.send_now(@campaign)
        SideFxCampaignService.new.after_send(@campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          @campaign.reload,
          params: jsonapi_serializer_params
        ).serializable_hash
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
        params: jsonapi_serializer_params,
        include: [:user]
      )
    end

    def stats
      render json: raw_json(EmailCampaigns::Delivery.status_counts(@campaign.id))
    end

    private

    def set_campaign
      @campaign = Campaign.find(params[:id])
      authorize @campaign
    end

    def campaign_context
      return @campaign_context if @campaign_context

      context_type = params[:campaign_context]
      context_id = params[:"#{context_type.underscore}_id"]
      context_model = case context_type
      when 'Project' then Project
      when 'Phase' then Phase
      else raise "Unsupported context level for campaigns: #{reactable_type}"
      end
      @campaign_context = context_model.find(context_id)
    end

    def campaign_params
      params.require(:campaign).permit(
        :enabled,
        :sender,
        :reply_to,
        :context_id,
        group_ids: [],
        subject_multiloc: I18n.available_locales,
        body_multiloc: I18n.available_locales
      )
    end
  end
end
