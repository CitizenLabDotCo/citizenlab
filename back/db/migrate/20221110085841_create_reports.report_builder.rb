# frozen_string_literal: true

# This migration comes from report_builder (originally 20221109151729)

class CreateReports < ActiveRecord::Migration[6.1]
  def change
    create_table :report_builder_reports, id: :uuid do |t|
      t.string :name, null: false, index: { unique: true }
      t.timestamps
    end
  end
end
