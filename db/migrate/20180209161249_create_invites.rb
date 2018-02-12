class CreateInvites < ActiveRecord::Migration[5.1]
  def change
    create_table :invites, id: :uuid do |t|
      t.string :token, null: false, index: true
      t.string :email, null: false
      t.references :inviter, foreign_key: { to_table: :users }, null: false, type: :uuid
      t.references :group, foreign_key: true, null: false, type: :uuid

      t.timestamps
    end
  end
end
