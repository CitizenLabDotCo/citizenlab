# frozen_string_literal: true

class WebApi::V1::Files::TranscriptsController < ApplicationController
  before_action :set_file
  before_action :set_transcript, only: [:show]

  # GET /web_api/v1/files/:file_id/transcript
  def show
    authorize @file, :show?
    render json: @transcript, serializer: WebApi::V1::Files::TranscriptSerializer
  end

  private

  def set_file
    @file = Files::File.find(params[:file_id])
  end

  def set_transcript
    @transcript = @file.transcript
    head :not_found if @transcript.nil?
  end
end
