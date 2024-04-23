# frozen_string_literal: true

class WebApi::V1::JobsController < ApplicationController
  def show
    job = QueJob.find(params[:id])
    authorize job

    render json: { data: { status: job.status, active: job.active? } }
  end
end
