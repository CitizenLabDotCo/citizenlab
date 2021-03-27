class AddMembershipTypesToGroups < ActiveRecord::Migration[5.1]
  def up
    add_column :groups, :membership_type, :string
    Group.update_all(membership_type: 'manual')
  end

  def down
    remove_column :groups, :membership_type
  end
end
