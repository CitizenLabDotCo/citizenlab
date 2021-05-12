module Moderation
  class WebApi::V1::ModerationsController < ApplicationController

    def index
      @moderations = policy_scope(Moderation)
      @moderations = @moderations.where(id: Idea.published)
        .or(@moderations.where(id: Initiative.published))
        .or(@moderations.where(id: Comment.published))
        .includes(:moderation_status) # , :inappropriate_content_flag) ### TODO patch
        .order(created_at: :desc)
      
      @moderations = @moderations.with_moderation_status(params[:moderation_status]) if params[:moderation_status].present?
      @moderations = @moderations.where(moderatable_type: params[:moderatable_types]) if params[:moderatable_types].present?
      @moderations = @moderations.where(project_id: params[:project_ids]) if params[:project_ids].present?
      @moderations = @moderations.search_by_all(params[:search]) if params[:search].present?

      @moderations = @moderations
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      render json: linked_json(@moderations, WebApi::V1::ModerationSerializer, params: fastjson_params, include: [:inappropriate_content_flag]) ### TODO patch
    end

    def update
      @moderation = Moderation.find_by(
        moderatable_type: params[:moderatable_type],
        id: params[:moderatable_id]
      )
      authorize @moderation

      if moderation_params[:moderation_status]
        @moderation_status = @moderation.moderation_status
        if !@moderation_status
          @moderation_status = ModerationStatus.create!(
            moderatable: @moderation.source_record,
            status: moderation_params[:moderation_status]
          )
          SideFxModerationStatusService.new.after_create(@moderation_status, current_user)
        else
          @moderation_status.update!(status: moderation_params[:moderation_status])
          SideFxModerationStatusService.new.after_update(@moderation_status, current_user)
        end
      end

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
end