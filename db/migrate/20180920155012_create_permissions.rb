class CreatePermissions < ActiveRecord::Migration[5.1]
  def change
    create_table :permissions, id: :uuid do |t|
      t.string :action, null: false, index: true
      t.string :permitted_by, null: false
      t.uuid :participation_context_id, null: false, index: true
      t.string :participation_context_type, null: false

      t.timestamps
    end
  end
end