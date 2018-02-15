class CreateInvites < ActiveRecord::Migration[5.1]
  def change
    create_table :invites, id: :uuid do |t|
      t.string :token, null: false, index: true
      t.references :inviter, foreign_key: { to_table: :users }, null: false, type: :uuid
      t.references :invitee, foreign_key: { to_table: :users }, null: false, type: :uuid

      t.timestamps
    end
  end
end
