# frozen_string_literal: true

class AddIncludeAllAreasToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :include_all_areas, :boolean, null: false, default: false
  end
end
