class WebApi::V1::IdeaStatusesController < ApplicationController
  before_action :set_idea_status, only: [:show]

  def index
    @idea_statuses = policy_scope(IdeaStatus).order(:ordering)
    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_statuses, params: fastjson_params).serialized_json
  end

  def show
    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_status, params: fastjson_params).serialized_json
  end

  private

  def set_idea_status
    @idea_status = IdeaStatus.find(params[:id])
    authorize @idea_status
  end

  def secure_controller?
    false
  end
end
