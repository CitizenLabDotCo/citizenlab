# frozen_string_literal: true

class WebApi::V1::Files::PreviewsController < ApplicationController
  before_action :set_file

  def show
    render json: WebApi::V1::Files::PreviewSerializer.new(
      @file.preview,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  private

  def set_file
    @file = Files::File.find(params[:id])
    authorize(@file, :show?)
  end
end
