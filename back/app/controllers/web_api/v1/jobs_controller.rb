# frozen_string_literal: true

class WebApi::V1::JobsController < ApplicationController
  def index
    where_conditions = params.permit(:context_id, :context_type, :project_id, :owner_id)
    completed = Utils.to_bool(params[:completed]) if params[:completed]

    job_trackers = policy_scope(Jobs::Tracker)
      .where(where_conditions)
      .then { |scope| scope.completed(completed) }
      .order(created_at: :desc)
      .then { |scope| paginate(scope) }

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
end
