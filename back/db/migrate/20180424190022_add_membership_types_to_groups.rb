class AddMembershipTypesToGroups < ActiveRecord::Migration[5.1]
  def change
    add_column :groups, :membership_type, :string
    Group.update_all(membership_type: 'manual')
  end
end
