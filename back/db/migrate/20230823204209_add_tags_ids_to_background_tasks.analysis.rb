# frozen_string_literal: true

# This migration comes from analysis (originally 20230823203929)
class AddTagsIdsToBackgroundTasks < ActiveRecord::Migration[7.0]
  def change
    add_column :analysis_background_tasks, :tags_ids, :jsonb
  end
end
