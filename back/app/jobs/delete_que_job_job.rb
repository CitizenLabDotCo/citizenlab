# frozen_string_literal: true

class DeleteQueJobJob < ApplicationJob
  def run(job_id)
    QueJob.find(job_id).destroy
  rescue ActiveRecord::RecordNotFound
    # The job was already deleted, nothing to do.
  end
end
