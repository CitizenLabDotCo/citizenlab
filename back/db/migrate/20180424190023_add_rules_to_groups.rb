class AddRulesToGroups < ActiveRecord::Migration[5.1]
  def change
    add_column :groups, :membership_type, :string
    add_column :groups, :rules, :jsonb, default: []
    Group.update_all(membership_type: 'manual')
  end
end
