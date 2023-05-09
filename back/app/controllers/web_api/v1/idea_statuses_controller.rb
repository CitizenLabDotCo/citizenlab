# frozen_string_literal: true

class WebApi::V1::IdeaStatusesController < ApplicationController
  before_action :set_idea_status, except: %i[index]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    @idea_statuses = policy_scope(IdeaStatus)
    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_statuses).serializable_hash.to_json, status: :ok
  end

  def show
    render json: WebApi::V1::IdeaStatusSerializer.new(@idea_status).serializable_hash.to_json, status: :ok
  end

  private

  def set_idea_status
    @idea_status = IdeaStatus.find(params[:id])
    authorize @idea_status
  end
end
