# frozen_string_literal: true

class CreateReports < ActiveRecord::Migration[6.1]
  def change
    create_table :report_builder_reports, id: :uuid do |t|
      t.string :name, null: false, index: { unique: true }
      t.timestamps
    end
  end
end
