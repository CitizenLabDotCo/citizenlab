# frozen_string_literal: true

#
# Controller of Idea Statuses
#
#   Base url:
#     /web_api/v1/idea_statuses
#
class WebApi::V1::IdeaStatusesController < ApplicationController
  before_action :set_idea_status, only: [:show]
  skip_before_action :authenticate_user, only: [:index, :show]

  def index
    @idea_statuses = policy_scope(IdeaStatus)
    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_statuses).serialized_json, status: :ok
  end

  def show
    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_status).serialized_json, status: :ok
  end

  private

  def set_idea_status
    @idea_status = IdeaStatus.find(params[:id])
    authorize @idea_status
  end
end
