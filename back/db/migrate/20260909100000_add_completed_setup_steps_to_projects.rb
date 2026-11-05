# frozen_string_literal: true

class AddCompletedSetupStepsToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :projects, :completed_setup_steps, :jsonb, default: [], null: false
  end
end
