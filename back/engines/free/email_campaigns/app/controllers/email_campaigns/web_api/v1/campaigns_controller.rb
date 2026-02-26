# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::CampaignsController < EmailCampaignsController
    before_action :set_campaign, only: %i[show update do_send cancel_sending send_preview preview deliveries stats destroy]
    skip_after_action :verify_authorized, only: %i[supported_campaign_names]

    def index
      @campaigns = CampaignPolicy::Scope.new(pundit_user, Campaign, campaign_context)
        .resolve
        .order(created_at: :desc)
      # Necessary because we instantiate the scope directly instead of using Pundit's
      # `policy_scope` method.
      skip_policy_scope

      if params[:without_campaign_names]
        campaign_types = params[:without_campaign_names].map { |name| Campaign.from_campaign_name(name) }
        @campaigns = @campaigns.where.not(type: campaign_types)
      end

      if campaign_context
        @campaigns = @campaigns.where(context: campaign_context)
        supported_ids = @campaigns.filter { |campaign| campaign.class.supports_context?(campaign_context) }.map(&:id)
        @campaigns = @campaigns.where(id: supported_ids)
      end

      @campaigns = parse_bool(params[:manual]) ? @campaigns.manual : @campaigns.automatic if params[:manual]

      @campaigns = paginate @campaigns

      render json: linked_json(@campaigns, WebApi::V1::CampaignSerializer, params: jsonapi_serializer_params)
    end

    def show
      render json: WebApi::V1::CampaignSerializer.new(@campaign, params: jsonapi_serializer_params).serializable_hash
    end

    def create
      @campaign = EmailCampaigns::DeliveryService.new.campaign_classes.find do |claz|
        claz.campaign_name == params[:campaign][:campaign_name]
      end.new
      @campaign.assign_attributes(campaign_params)
      @campaign.author ||= current_user
      if campaign_context
        if !@campaign.class.supports_context?(campaign_context)
          raise Pundit::NotAuthorizedErrorWithReason, reason: 'Context not supported by campaign'
        end

        @campaign.context = campaign_context
      end

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

    def cancel_sending
      if @campaign.manual? && @campaign.scheduled_at.present? && !@campaign.sent?
        @campaign.update!(scheduled_at: nil)
        SideFxCampaignService.new.after_update(@campaign, current_user)
        render json: WebApi::V1::CampaignSerializer.new(
          @campaign,
          params: jsonapi_serializer_params
        ).serializable_hash, status: :ok
      else
        head :unprocessable_entity
      end
    end

    def send_preview
      EmailCampaigns::DeliveryService.new.send_preview(@campaign, current_user)
      head :ok
    end

    def preview
      preview = EmailCampaigns::DeliveryService.new.preview_email(@campaign, current_user)
      render json: {
        data: {
          id: @campaign.id,
          type: 'campaign_preview',
          attributes: preview
        }
      }
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

    def supported_campaign_names
      campaigns = DeliveryService::CAMPAIGN_CLASSES.select do |claz|
        claz.supports_context?(campaign_context)
      end
      render json: raw_json(campaigns.map(&:campaign_name))
    end

    private

    def set_campaign
      @campaign = Campaign.find(params[:id])
      authorize @campaign
    end

    def campaign_context
      return @campaign_context if @campaign_context

      context_type = params[:campaign_context]
      return @campaign_context = nil if !context_type

      context_id = params[:"#{context_type.underscore}_id"]
      context_model = case context_type
      when 'Project' then Project
      when 'Phase' then Phase
      else raise "Unsupported context level for campaigns: #{reactable_type}"
      end
      @campaign_context = context_model.find(context_id)
    end

    def campaign_params
      @campaign.manual? ? manual_campaign_params : automated_campaign_params
    end

    def manual_campaign_params
      params.require(:campaign).permit(
        :enabled,
        :sender,
        :reply_to,
        :scheduled_at,
        group_ids: [],
        subject_multiloc: I18n.available_locales,
        body_multiloc: I18n.available_locales
      )
    end

    def automated_campaign_params
      params.require(:campaign).permit(
        :enabled,
        :reply_to,
        subject_multiloc: I18n.available_locales,
        title_multiloc: I18n.available_locales,
        intro_multiloc: I18n.available_locales,
        button_text_multiloc: I18n.available_locales
      )
    end
  end
end
