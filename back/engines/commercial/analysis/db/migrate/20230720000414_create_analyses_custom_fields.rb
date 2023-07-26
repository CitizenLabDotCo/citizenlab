# frozen_string_literal: true

class CreateAnalysesCustomFields < ActiveRecord::Migration[7.0]
  def change
    create_table :analysis_analyses_custom_fields, id: :uuid do |t|
      t.references :analysis, foreign_key: { to_table: :analysis_analyses }, type: :uuid, index: true
      t.references :custom_field, foreign_key: true, type: :uuid, index: true

      t.timestamps
    end
    add_index(
      :analysis_analyses_custom_fields,
      %i[analysis_id custom_field_id],
      unique: true,
      name: 'index_analysis_analyses_custom_fields'
    )
  end
end
