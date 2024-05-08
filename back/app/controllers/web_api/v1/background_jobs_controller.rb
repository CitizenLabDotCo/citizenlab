# frozen_string_literal: true

class WebApi::V1::BackgroundJobsController < ApplicationController
  skip_after_action :verify_policy_scoped

  def index
    authorize :jobs, policy_class: BackgroundJobPolicy
    job_ids = params[:ids]

    scoped_jobs = policy_scope(QueJob.all, policy_scope_class: BackgroundJobPolicy::Scope)
    render json: ::WebApi::V1::BackgroundJobSerializer.new(
      scoped_jobs.all_by_job_ids(job_ids),
      params: jsonapi_serializer_params
    ).serializable_hash
  end
end
