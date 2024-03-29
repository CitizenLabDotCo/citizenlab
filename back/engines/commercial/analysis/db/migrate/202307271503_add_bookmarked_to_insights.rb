# frozen_string_literal: true

class AddBookmarkedToInsights < ActiveRecord::Migration[7.0]
  def change
    add_column :analysis_insights, :bookmarked, :boolean, default: false, null: false
  end
end
