# frozen_string_literal: true

# == Schema Information
#
# Table name: jobs_trackers
#
#  id            :uuid             not null, primary key
#  root_job_id   :bigint           not null
#  root_job_type :string           not null
#  progress      :integer          default(0), not null
#  total         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  owner_id      :uuid
#  completed_at  :datetime
#  context_type  :string
#  context_id    :uuid
#  project_id    :uuid
#  error_count   :integer          default(0), not null
#
# Indexes
#
#  index_jobs_trackers_on_completed_at   (completed_at)
#  index_jobs_trackers_on_context        (context_type,context_id)
#  index_jobs_trackers_on_owner_id       (owner_id)
#  index_jobs_trackers_on_project_id     (project_id)
#  index_jobs_trackers_on_root_job_id    (root_job_id) UNIQUE
#  index_jobs_trackers_on_root_job_type  (root_job_type)
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#  fk_rails_...  (project_id => projects.id)

# +Jobs::Tracker+ provides progress tracking for ActiveJob job trees. It is meant to be used
# in conjunction with the +Jobs::TrackableJob+ concern. Ideally, the methods of
# +Jobs::TrackableJob+ should be used to update the tracker, rather than updating
# it directly.
#
# A job tree consists of a root job and the jobs it enqueues recursively via +enqueue_child_job+.
#
# == Progress Tracking Fields
#
# * +total+: Expected number of work units
# * +progress+: Completed work units
# * +error_count+: Failed work units
#
# The definition of a work unit is left to the job. It can be anything that makes sense
# for that job (e.g., number of items processed, number of API calls made, etc.). The
# guarantees it provides regarding the accuracy of progress are also the responsibility
# of the job. Depending on the context, it might not always be possible to provide an
# accurate estimate, and the estimate may change during execution due to external factors.
#
# == Metadata
#
# The +context+, +project+, +owner+, and +root_job_type+ fields are used for filtering
# and authorization. They provide information about the context in which the job is
# executed.
#
# == Lifecycle
#
# 1. Created when the job is enqueued with tracking
# 2. Updated as the job progresses
# 3. Marked complete when the job finishes
# 4. Retained for audit purposes
module Jobs
  class Tracker < ApplicationRecord
    # The `root_job` is optional because Que removes the jobs that are completed. So,
    # eventually the `root_job` will be null.
    belongs_to :root_job, class_name: 'QueJob', optional: true
    belongs_to :owner, class_name: 'User', optional: true
    belongs_to :context, polymorphic: true, optional: true
    belongs_to :project, optional: true

    validates :root_job_type, presence: true
    validates :total, numericality: { greater_than_or_equal_to: :progress }, allow_nil: true
    validates :progress, numericality: { greater_than_or_equal_to: :error_count }
    validates :error_count, numericality: { greater_than_or_equal_to: 0 }

    def completed?
      completed_at.present?
    end

    def in_progress?
      progress > 0
    end

    def pending?
      progress == 0
    end

    def status
      if completed?
        :completed
      elsif in_progress?
        :in_progress
      else
        :pending
      end
    end

    def complete!
      Tracker
        .where(id: id, completed_at: nil)
        .update_all(completed_at: Time.current)

      reload
    end

    def increment_progress(progress = 1, error_count = 0)
      if error_count > progress
        raise ArgumentError, 'error_count must be less than or equal to progress'
      end

      Tracker.where(id: id, completed_at: nil).update_all(
        progress: Arel.sql('progress + ?', progress),
        error_count: Arel.sql('error_count + ?', error_count),
        total: Arel.sql('GREATEST(total, progress + ?)', progress)
      )

      reload
    end
  end
end
