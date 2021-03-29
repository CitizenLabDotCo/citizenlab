# This migration comes from smart_groups (originally 20180424190024)
class AddRulesToGroups < ActiveRecord::Migration[5.1]
  def up
    return if column_exists? :groups, :rules

    add_column :groups, :rules, :jsonb, default: []
  end

  def down
    remove_column :groups, :rules
  end
end
