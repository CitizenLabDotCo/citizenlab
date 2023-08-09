# frozen_string_literal: true

class WebApi::V1::CosponsorsInitiativesController < ApplicationController
  def accept_invite
    @cosponsors_initiative = CosponsorsInitiative.find(params[:id])
    authorize @cosponsors_initiative, :accept_invite?
    @cosponsors_initiative.update!(status: 'accepted')
  end
end
