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
#
module Jobs
  class Tracker < ApplicationRecord
    # The `root_job` is optional because Que removes the jobs that are completed. So,
    # eventually the `root_job` will be null.
    belongs_to :root_job, class_name: 'QueJob', optional: true
    belongs_to :owner, class_name: 'User', optional: true
    belongs_to :context, polymorphic: true, optional: true
    belongs_to :project, optional: true

    validates :root_job_type, presence: true
    validates :progress, numericality: { greater_than_or_equal_to: 0 }
    validates :error_count, numericality: { greater_than_or_equal_to: 0 }
    validates :total, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

    def completed?
      completed_at.present?
    end

    def in_progress?
      progress + error_count > 0
    end

    def pending?
      progress + error_count == 0
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
      Tracker.where(id: id, completed_at: nil).update_all(
        progress: Arel.sql('progress + ?', progress),
        error_count: Arel.sql('error_count + ?', error_count),
        total: Arel.sql('GREATEST(total, progress + error_count + ?)', progress + error_count)
      )

      reload
    end
  end
end
