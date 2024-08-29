class AddMembershipsCountToGroups < ActiveRecord::Migration[7.0]
  def change
    add_column :groups, :memberships_count, :integer, null: false, default: 0, if_not_exists: true
  end
end
