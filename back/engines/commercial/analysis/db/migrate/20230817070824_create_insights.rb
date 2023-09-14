# frozen_string_literal: true

class CreateInsights < ActiveRecord::Migration[7.0]
  def change
    create_table :analysis_insights, id: :uuid do |t|
      t.references :analysis, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_analyses }
      t.references :insightable, type: :uuid, null: false, index: true, polymorphic: true
      t.jsonb :filters, default: {}, null: false
      t.jsonb :inputs_ids

      t.timestamps
    end

    # Create insights record for each summary in our database
    insert_query = <<~SQL.squish
      INSERT INTO analysis_insights
        (analysis_id,   insightable_type,     insightable_id,  filters, inputs_ids, created_at, updated_at)
      SELECT 
         analysis_id,   'Analysis::Summary',  id,              filters, inputs_ids, created_at, updated_at
      FROM analysis_summaries;
    SQL
    execute(insert_query)

    # Delete the columns that now live in the insights table
    remove_column(:analysis_summaries, :filters)
    remove_column(:analysis_summaries, :inputs_ids)
    remove_column(:analysis_summaries, :analysis_id)
  end
end
