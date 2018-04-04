class CreateInvites < ActiveRecord::Migration[5.1]
  def change
    create_table :invites, id: :uuid do |t|
      t.string :token, null: false, index: true
      t.references :inviter, foreign_key: { to_table: :users }, null: true, type: :uuid
      t.references :invitee, foreign_key: { to_table: :users }, null: false, type: :uuid
      t.string :invite_text, null: true
      t.datetime :accepted_at

      t.timestamps
    end
  end
end
