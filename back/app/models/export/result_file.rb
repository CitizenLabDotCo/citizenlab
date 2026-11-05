# frozen_string_literal: true

# == Schema Information
#
# Table name: export_result_files
#
#  id              :uuid             not null, primary key
#  jobs_tracker_id :uuid             not null
#  name            :string           not null
#  content         :string
#  expires_at      :datetime         not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_export_result_files_on_expires_at       (expires_at)
#  index_export_result_files_on_jobs_tracker_id  (jobs_tracker_id)
#
# Foreign Keys
#
#  fk_rails_...  (jobs_tracker_id => jobs_trackers.id)
#
module Export
  # A transient file produced by a background export job (e.g. the input
  # responses PDF). It belongs to the +Jobs::Tracker+ of the job that produced
  # it, is downloaded once by the user who requested the export, and expires
  # shortly after creation (swept by +Export::CleanupExpiredResultsJob+).
  #
  # Deliberately not a +Files::File+: these exports may contain PII, must not
  # show up in the project Files tab, and must not trigger any of the AI
  # processing hooks.
  class ResultFile < ApplicationRecord
    self.table_name = 'export_result_files'

    EXPIRY = 1.day

    belongs_to :tracker, class_name: 'Jobs::Tracker', foreign_key: :jobs_tracker_id, inverse_of: false

    mount_uploader :content, BaseFileUploader

    attribute :expires_at, :datetime, default: -> { EXPIRY.from_now }

    validates :name, presence: true
    validates :content, presence: true
    validates :expires_at, presence: true

    scope :expired, -> { where(expires_at: ..Time.current) }
  end
end
