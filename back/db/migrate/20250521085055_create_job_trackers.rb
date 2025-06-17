# frozen_string_literal: true

class CreateJobTrackers < ActiveRecord::Migration[7.1]
  def change
    create_table :jobs_trackers, id: :uuid do |t|
      t.bigint :root_job_id, null: false, index: { unique: true }
      t.string :root_job_type, null: false, index: true
      t.integer :progress, default: 0, null: false
      t.integer :total

      t.timestamps
    end
  end
end
