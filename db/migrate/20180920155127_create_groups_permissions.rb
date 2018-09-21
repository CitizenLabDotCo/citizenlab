class CreateGroupsPermissions < ActiveRecord::Migration[5.1]
  def change
    create_table :groups_permissions, id: :uuid do |t|
      t.references :permission, null: false, index: true
      t.references :group, null: false

      t.timestamps
    end
  end
end
