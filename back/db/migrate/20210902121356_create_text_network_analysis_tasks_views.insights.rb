# frozen_string_literal: true
# This migration comes from insights (originally 20210727120001)

class CreateTextNetworkAnalysisTasksViews < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_text_network_analysis_tasks_views, id: :uuid do |t|
      t.references :task, type: :uuid, null: false, index: true, foreign_key: { to_table: :nlp_text_network_analysis_tasks }
      t.references :view, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_views }
      t.string :language, null: false

      t.timestamps
    end
  end
end
