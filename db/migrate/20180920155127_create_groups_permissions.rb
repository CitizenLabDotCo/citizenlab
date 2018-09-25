class CreateGroupsPermissions < ActiveRecord::Migration[5.1]
  def change
    create_table :groups_permissions, id: :uuid do |t|
      t.references :permission, foreign_key: true, type: :uuid, null: false, index: true
      t.references :group, foreign_key: true, type: :uuid, null: false

      t.timestamps
    end
  end
end
