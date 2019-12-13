class WebApi::V1::ModerationsController < ApplicationController

  def index
    ids = Idea.published.ids + Initiative.published.ids + Comment.published.ids
    @moderations = policy_scope(Moderation)
    @moderations = @moderations.where(id: Idea.published)
      .or(@moderations.where(id: Initiative.published))
      .or(@moderations.where(id: Comment.published))
      .order(created_at: :desc)

    @moderations = @moderations.moderation_status(status: params[:moderation_status]) if params[:moderation_status].present?

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

    @moderation.assign_attributes moderation_params
    authorize @moderation
    SideFxModerationService.new.before_update(@moderation, current_user)
    if @moderation.save
      SideFxModerationService.new.after_update(@moderation, current_user)
      render json: WebApi::V1::ModerationSerializer.new(
        @moderation, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @moderation.errors.details }, status: :unprocessable_entity
    end
  end

  def moderation_params
    params.require(:moderation).permit(
      :moderation_status
    )
  end
end