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
#
# Indexes
#
#  index_jobs_trackers_on_owner_id       (owner_id)
#  index_jobs_trackers_on_root_job_id    (root_job_id) UNIQUE
#  index_jobs_trackers_on_root_job_type  (root_job_type)
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#
module Jobs
  class Tracker < ApplicationRecord
    # The `root_job` is optional because Que removes the jobs that are completed. So,
    # eventually the `root_job` will be null.
    belongs_to :root_job, class_name: 'QueJob', optional: true
    belongs_to :owner, polymorphic: true, optional: true

    validates :root_job_type, presence: true
    validates :progress, numericality: { greater_than_or_equal_to: 0 }
    validates :total, numericality: { greater_than: 0 }, allow_nil: true

    def increment_progress(increment = 1)
      self.class.update_counters(id, progress: increment)
      reload
    end

    def complete
      self.progress = total
      save
    end

    def percentage
      return 100 if progress >= total

      (progress.to_f / total * 100).round
    end
  end
end
