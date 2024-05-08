# frozen_string_literal: true

class WebApi::V1::BackgroundJobsController < ApplicationController
  skip_after_action :verify_policy_scoped

  def index
    authorize :jobs, policy_class: BackgroundJobPolicy
    job_ids = params[:ids]

    scoped_jobs = policy_scope(QueJob.all, policy_scope_class: BackgroundJobPolicy::Scope)
    render json: ::WebApi::V1::BackgroundJobSerializer.new(
      sanitize_errors(scoped_jobs.all_by_job_ids(job_ids)),
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  private

  # We don't want to return all errors - only those we have deliberately caught - only bulk_import currently
  def sanitize_errors(jobs)
    jobs.map do |job|
      if job[:last_error_message]
        last_error_message = job[:last_error_message].split(": ")&.last
        last_error_message = 'uncaught_error' unless last_error_message&.start_with?('bulk_import_')
        job[:last_error_message] = last_error_message
      end
      job
    end
  end
end
