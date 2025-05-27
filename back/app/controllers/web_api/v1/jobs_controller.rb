# frozen_string_literal: true

class WebApi::V1::JobsController < ApplicationController
  def index
    job_trackers = paginate(Jobs::Tracker.all.order(created_at: :desc))

    render json: linked_json(
      policy_scope(job_trackers),
      WebApi::V1::Jobs::TrackerSerializer,
      params: jsonapi_serializer_params
    )
  end

  def show
    job_tracker = Jobs::Tracker.find(params[:id])
    authorize(job_tracker)

    render json: WebApi::V1::Jobs::TrackerSerializer.new(
      job_tracker,
      params: jsonapi_serializer_params
    ).serializable_hash
  end
end
