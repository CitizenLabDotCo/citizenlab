# frozen_string_literal: true

module Moderation
  class WebApi::V1::ModerationsController < ApplicationController
    after_action :verify_authorized, except: %i[index moderations_count]
    after_action :verify_policy_scoped, only: %i[index moderations_count]

    def index
      @moderations = policy_scope(published_moderations)
        .includes(*include_load_resources)
        .order(created_at: :desc)

      index_filter

      @moderations = @moderations
        .page(params.dig(:page, :number))
        .per(params.dig(:page, :size))
      render json: linked_json(@moderations, WebApi::V1::ModerationSerializer, params: jsonapi_serializer_params, include: include_serialize_resources)
    end

    def update
      @moderation = Moderation.find_by(
        moderatable_type: params[:moderatable_type],
        id: params[:moderatable_id]
      )
      authorize @moderation

      if moderation_params[:moderation_status]
        @moderation_status = @moderation.moderation_status
        if @moderation_status
          @moderation_status.update!(status: moderation_params[:moderation_status])
          SideFxModerationStatusService.new.after_update(@moderation_status, current_user)
        else
          @moderation_status = ModerationStatus.create!(
            moderatable: @moderation.source_record,
            status: moderation_params[:moderation_status]
          )
          SideFxModerationStatusService.new.after_create(@moderation_status, current_user)
        end
      end

      render json: WebApi::V1::ModerationSerializer.new(
        @moderation.reload,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    end

    def moderations_count
      @moderations = policy_scope(published_moderations)

      index_filter

      render json: raw_json({ count: @moderations.count }), status: :ok
    end

    def moderation_params
      params.require(:moderation).permit(
        :moderation_status
      )
    end

    private

    def include_load_resources
      [:moderation_status]
    end

    def include_serialize_resources
      []
    end

    def published_moderations
      ideas = IdeasFinder.new({}, scope: Idea.published, current_user: current_user).find_records
      Moderation.where(id: ideas)
        .or(Moderation.where(id: Initiative.published))
        .or(Moderation.where(id: Comment.published))
    end

    def index_filter
      @moderations = @moderations.with_moderation_status(params[:moderation_status]) if params[:moderation_status].present?
      @moderations = @moderations.where(moderatable_type: params[:moderatable_types]) if params[:moderatable_types].present?
      @moderations = @moderations.where(project_id: params[:project_ids]) if params[:project_ids].present?
      @moderations = @moderations.search_by_all(params[:search]) if params[:search].present?
    end
  end
end

Moderation::WebApi::V1::ModerationsController.prepend(FlagInappropriateContent::Patches::WebApi::V1::ModerationsController)
