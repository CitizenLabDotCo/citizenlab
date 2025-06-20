# frozen_string_literal: true

module Jobs
  module TrackableJob
    extend ActiveSupport::Concern

    def tracker
      ::Jobs::Tracker.find_sole_by(root_job_id: root_job_id)
    end

    def tracked?
      !!tracker
    rescue ActiveRecord::RecordNotFound
      false
    end

    class_methods do
      def with_tracking(owner: nil)
        JobWithTracking.new(self, owner)
      end
    end

    private

    def track_progress(progress = 1, error_count = 0)
      tracker.increment_progress(progress, error_count) if tracked?
    end

    def update_tracker_total(total)
      tracker.update!(total: total) if tracked?
    end

    def ensure_tracker_total(total)
      tracker.update!(total: total) if tracked? && tracker.total.nil?
    end

    def mark_as_complete!
      tracker.complete! if tracked?
    end

    # Has the same signature as the job's +perform+ method.
    def estimate_tracker_total(...)
      nil
    end

    def job_tracking_context
      raise NotImplementedError
    end

    def enqueue_child_job(job_class, ...)
      return job_class.perform_later(...) unless tracked?

      QueJob.transaction do
        related_job = job_class.perform_later(...)
        related_job.que_job.update!(data: { root_job_id: root_job_id })

        related_job
      end
    end

    def root_job_id
      que_job.data['root_job_id'] || que_job.id
    end

    class JobWithTracking
      def initialize(job_class, owner = nil)
        @job_class = job_class
        @owner = owner
      end

      delegate :perform_now, to: :@job_class

      def perform_later(...)
        QueJob.transaction do
          job = @job_class.perform_later(...)
          context = job.send(:job_tracking_context)

          ::Jobs::Tracker.create!(
            root_job_id: job.send(:root_job_id),
            root_job_type: job.class.name,
            total: job.send(:estimate_tracker_total, ...),
            owner_id: @owner&.id,
            context: context,
            project_id: context.try(:project_id)
          )

          job
        end
      end
    end
  end
end
