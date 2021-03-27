class AddRulesToGroups < ActiveRecord::Migration[5.1]
  def change
    add_column :groups, :rules, :jsonb, default: []
  end
end
