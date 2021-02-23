# frozen_string_literal: true

#
# Controller of Idea Statuses
#
#   Base url:
#     /web_api/v1/idea_statuses
#
class WebApi::V1::IdeaStatusesController < ApplicationController
  skip_before_action :authenticate_user

  def index
    @idea_statuses = policy_scope(IdeaStatus)
    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_statuses).serialized_json, status: :ok
  end

  def show
    @idea_status = IdeaStatus.find(params[:id])
    authorize @idea_status

    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_status).serialized_json, status: :ok
  end
end
