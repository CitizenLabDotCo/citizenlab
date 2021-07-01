class AddInputsCountToCategory < ActiveRecord::Migration[6.0]
  def change
    add_column :insights_categories, :inputs_count, :integer, null: false, default: 0
  end
end
