# frozen_string_literal: true

class WebApi::V1::Files::TranscriptsController < ApplicationController
  before_action :set_file
  before_action :set_transcript, only: [:show]

  # GET /web_api/v1/files/:id/transcript
  def show
    render json: WebApi::V1::Files::TranscriptSerializer.new(
      @transcript,
      params: jsonapi_serializer_params
    )
  end

  private

  def set_file
    @file = Files::File.find(params[:id])
    authorize @file, :show?
  end

  def set_transcript
    @transcript = @file.transcript
    head :not_found if @transcript.nil?
  end
end
