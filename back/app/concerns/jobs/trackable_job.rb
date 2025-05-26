# frozen_string_literal: true

module Jobs
  module TrackableJob
    extend ActiveSupport::Concern

    class_methods do
      def perform_later_with_tracking(...)
        QueJob.transaction do
          job = perform_later(...)
          total = dry_run_total(...)
          job.send(:start_tracking, total)
        end
      end

      def dry_run_total(...)
        nil
      end
    end

    private

    def start_tracking(total = 100)
      @tracker = Jobs::Tracker.create!(
        root_job_id: root_job_id,
        root_job_type: self.class.name,
        total: total
      )
    end

    def track_progress(increment = 1)
      tracker.increment_progress(increment)
    end

    def tracker
      @tracker ||= Jobs::Tracker.find_sole_by(root_job_id: root_job_id)
    end

    def tracked?
      !!tracker
    rescue ActiveRecord::RecordNotFound
      false
    end

    def enqueue_child_job(job_class, ...)
      raise 'Job is not being tracked' unless tracked?

      QueJob.transaction do
        related_job = job_class.perform_later(...)
        related_job.que_job.update!(data: { root_job_id: root_job_id })
        related_job
      end
    end

    def root_job_id
      que_job.data['root_job_id'] || que_job.id
    end
  end
end
