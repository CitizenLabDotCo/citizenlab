# frozen_string_literal: true

class WebApi::V1::JobsController < ApplicationController
  def index
    job_trackers = Jobs::Tracker
      .where(index_params)
      .order(created_at: :desc)
      .then { paginate(_1) }
      .then { policy_scope(_1) }

    render json: linked_json(
      job_trackers,
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

  private

  def index_params
    params.permit(
      :context_id, :context_type,
      :project_id,
      :owner_id
    )
  end
end
