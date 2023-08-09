# frozen_string_literal: true

class WebApi::V1::CosponsorsInitiativesController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized

  def show
    @cosponsors_initiative = CosponsorsInitiative.find(params[:id])
    authorize @cosponsors_initiative

    render json: WebApi::V1::CosponsorsInitiativeSerializer.new(
      @cosponsors_initiative,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def accept_invite
    @cosponsors_initiative = CosponsorsInitiative.find(params[:id])
    authorize @cosponsors_initiative, :accept_invite?

    if @cosponsors_initiative.update(status: 'accepted')
      render json: WebApi::V1::CosponsorsInitiativeSerializer.new(
        @cosponsors_initiative,
        params: jsonapi_serializer_params
      ).serializable_hash
    end
  end
end
