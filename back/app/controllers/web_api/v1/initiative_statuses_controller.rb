# frozen_string_literal: true

class WebApi::V1::InitiativeStatusesController < ApplicationController
  before_action :set_initiative_status, only: :show
  skip_before_action :authenticate_user

  def index
    @initiative_statuses = policy_scope(InitiativeStatus).order(:ordering)
    render json: WebApi::V1::InitiativeStatusSerializer.new(@initiative_statuses, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    render json: WebApi::V1::InitiativeStatusSerializer.new(@initiative_status, params: jsonapi_serializer_params).serializable_hash
  end

  private

  def set_initiative_status
    @initiative_status = InitiativeStatus.find(params[:id])
    authorize @initiative_status
  end
end
