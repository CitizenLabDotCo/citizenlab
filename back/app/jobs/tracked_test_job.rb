# frozen_string_literal: true

class TrackedTestJob < ApplicationJob
  include Jobs::TrackableJob

  def run(num_children_jobs)
    track_progress(1)
    num_children_jobs -= 1

    if num_children_jobs > 0
      enqueue_child_job(self.class.set(wait: 3.seconds), num_children_jobs)
    end
  end

  def estimate_tracker_total(num_children_jobs)
    num_children_jobs
  end
end
