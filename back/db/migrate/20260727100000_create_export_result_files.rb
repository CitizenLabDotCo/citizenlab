# frozen_string_literal: true

# Transient files produced by background export jobs (e.g. the input responses
# PDF). Each result belongs to the Jobs::Tracker of the job that produced it and
# expires shortly after creation (swept by Export::CleanupExpiredResultsJob).
class CreateExportResultFiles < ActiveRecord::Migration[7.2]
  def change
    create_table :export_result_files, id: :uuid do |t|
      t.references :jobs_tracker, type: :uuid, null: false, foreign_key: { to_table: :jobs_trackers }
      t.string :name, null: false
      t.string :content
      t.datetime :expires_at, null: false, index: true

      t.timestamps
    end
  end
end
