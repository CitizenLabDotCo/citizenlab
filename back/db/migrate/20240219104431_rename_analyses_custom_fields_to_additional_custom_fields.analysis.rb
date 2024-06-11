# This migration comes from analysis (originally 20240219103839)
class RenameAnalysesCustomFieldsToAdditionalCustomFields < ActiveRecord::Migration[7.0]
  def change
    rename_table :analysis_analyses_custom_fields, :analysis_additional_custom_fields

    change_column_null :analysis_additional_custom_fields, :analysis_id, false
    change_column_null :analysis_additional_custom_fields, :custom_field_id, false
  end
end
