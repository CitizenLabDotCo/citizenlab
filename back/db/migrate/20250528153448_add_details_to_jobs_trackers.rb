# frozen_string_literal: true

class AddDetailsToJobsTrackers < ActiveRecord::Migration[7.1]
  def change
    change_table :jobs_trackers, bulk: true do |t|
      t.datetime :completed_at, index: true
      t.references :context, polymorphic: true, type: :uuid
      t.references :project, type: :uuid, foreign_key: true
      t.integer :error_count, null: false, default: 0
    end
  end
end
