# frozen_string_literal: true

class AddFiltersToBackgroundTasks < ActiveRecord::Migration[7.0]
  def change
    add_column :analysis_background_tasks, :filters, :jsonb, default: {}, null: false
  end
end
