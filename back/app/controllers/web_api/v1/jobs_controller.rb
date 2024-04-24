# frozen_string_literal: true

# TODO: rename to BackgroundJobsController?
class WebApi::V1::JobsController < ApplicationController
  skip_after_action :verify_policy_scoped

  def index
    authorize :jobs, policy_class: JobPolicy
    job_ids = params[:ids]

    render json: ::WebApi::V1::JobSerializer.new(
      QueJob.by_ids(job_ids),
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def show
    job = QueJob.find(params[:id])
    authorize job

    render json: ::WebApi::V1::JobSerializer.new(
      job,
      params: jsonapi_serializer_params
    ).serializable_hash
  end
end
