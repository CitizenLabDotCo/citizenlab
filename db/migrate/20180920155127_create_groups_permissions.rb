class CreateGroupsPermissions < ActiveRecord::Migration[5.1]
  def change
    create_table :groups_permissions, id: :uuid do |t|
      t.reference :permission, null: false, index: true
      t.reference :group, null: false

      t.timestamps
    end
  end
end
