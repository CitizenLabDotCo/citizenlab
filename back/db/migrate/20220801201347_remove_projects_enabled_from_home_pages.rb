# frozen_string_literal: true

class RemoveProjectsEnabledFromHomePages < ActiveRecord::Migration[6.1]
  def change
    remove_column :home_pages, :projects_enabled, :boolean, default: true, null: false
  end
end
