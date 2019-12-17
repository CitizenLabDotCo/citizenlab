class WebApi::V1::ModerationsController < ApplicationController

  def index
    @moderations = policy_scope(Moderation)
    @moderations = @moderations.where(id: Idea.published)
      .or(@moderations.where(id: Initiative.published))
      .or(@moderations.where(id: Comment.published))
      .order(created_at: :desc)
    
    if params[:moderation_status].present?
      @moderations = @moderations.joins("LEFT JOIN moderation_statuses \
        ON moderation_statuses.moderatable_id = moderations.id AND \
           moderation_statuses.moderatable_type = moderations.moderatable_type"
      )
      @moderations = case params[:moderation_status]
      when 'read'
        @moderations.where(moderation_statuses: {status: 'read'})
      when 'unread'
        @moderations.where(moderation_statuses: {status: ['unread', nil]})
      end
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