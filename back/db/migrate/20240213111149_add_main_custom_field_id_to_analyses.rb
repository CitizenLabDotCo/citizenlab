class AddMainCustomFieldIdToAnalyses < ActiveRecord::Migration[7.0]
  def change
    add_reference :analysis_analyses, :main_custom_field, type: :uuid, index: true, foreign_key: { to_table: :custom_fields }

    # Move to seperate PR (after applying rake task)
    # change_column_null :analysis_analyses, :main_custom_field, false
  end
end
