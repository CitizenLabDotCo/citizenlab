# frozen_string_literal: true

class AddWeglotDataToIdeasAndOfficialFeedbacks < ActiveRecord::Migration[7.2]
  def change
    add_column :ideas, :weglot_data, :jsonb, default: {}, null: false
    add_column :official_feedbacks, :weglot_data, :jsonb, default: {}, null: false
  end
end
