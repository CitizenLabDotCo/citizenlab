class RenameCustomFormsTable < ActiveRecord::Migration[6.0]
  def change
    rename_table :custom_forms, :idea_custom_fields_custom_forms
    rename_column :projects, :custom_form_id, :idea_custom_fields_custom_form_id
  end
end
