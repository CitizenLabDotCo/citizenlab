class AddMembershipTypesToGroups < ActiveRecord::Migration[5.1]
  def up
    # This shouldn't be necessary because the migration timestamp already existed in schema_migrations.
    return if column_exists? :groups, :membership_type

    add_column :groups, :membership_type, :string
    Group.update_all(membership_type: 'manual')
  end

  def down
    remove_column :groups, :membership_type
  end
end
