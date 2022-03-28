class AddCustomFieldValuesToIdeas < ActiveRecord::Migration[6.1]
  def change
    add_column :ideas, :custom_field_values, :jsonb, default: {}
  end
end
