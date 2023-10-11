# frozen_string_literal: true

class WebApi::V1::LocationController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized
  
  def textsearch
    render json: raw_json(Location::Service.new.textsearch(params[:query]))
  end

  def geocode
    render json: raw_json(Location::Service.new.geocode(params[:address]))
  end

  def reverse_geocode
    render json: raw_json(Location::Service.new.reverse_geocode(params[:lat], params[:lng]))
  end
end