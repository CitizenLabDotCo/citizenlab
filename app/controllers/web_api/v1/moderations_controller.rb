class WebApi::V1::ModerationsController < ApplicationController

  def index
    ids = Idea.published.ids + Initiative.published.ids + Comment.published.ids
    @moderations = policy_scope(Moderation)
    @moderations = @moderations.where(id: Idea.published)
      .or(@moderations.where(id: Initiative.published))
      .or(@moderations.where(id: Comment.published))
      .order(created_at: :desc)
    
    if params[:moderation_status].present?
      # Doesn't work
      # @moderations = @moderations.joins(:moderation_status).where(moderation_statuses: {status: params[:moderation_status]})
      filtered_ids = ModerationStatus.where(status: params[:moderation_status]).pluck(:moderatable_id)
      if params[:moderation_status] == 'unread'
        filtered_ids += (Moderation.ids - ModerationStatus.pluck(:moderatable_id))
      end
      @moderations = @moderations.where(id: filtered_ids)
    end

    @moderations = @moderations
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: linked_json(@moderations, WebApi::V1::ModerationSerializer, params: fastjson_params)
  end

  def update
    [Idea,Initiative,Comment].each do |claz|
      @moderation ||= claz.where(id: params[:id]).first
    end
    # raise 404 if not found
    Idea.find params[:id] if !@moderation

    status = params[:moderation][:moderation_status]
    if status
      ModerationStatus.where(moderatable_id: @moderation.id).each(&:destroy!)
      ModerationStatus.create!(moderatable_id: @moderation.id, status: status)
    end

    # Failed to get there
    # @moderation.assign_attributes moderation_params

    # authorize @moderation
    # SideFxModerationService.new.before_update(@moderation, current_user)
    # if @moderation.save
    #   SideFxModerationService.new.after_update(@moderation, current_user)
    #   render json: WebApi::V1::ModerationSerializer.new(
    #     @moderation, 
    #     params: fastjson_params
    #     ).serialized_json, status: :ok
    # else
    #   render json: { errors: @moderation.errors.details }, status: :unprocessable_entity
    # end

    SideFxModerationService.new.after_update(@moderation.reload, current_user)
    render json: WebApi::V1::ModerationSerializer.new(
      @moderation.reload, 
      params: fastjson_params
      ).serialized_json, status: :ok
  end

  def moderation_params
    params.require(:moderation).permit(
      :moderation_status
    )
  end
end