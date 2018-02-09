class CreateInvites < ActiveRecord::Migration[5.1]
  def change
    create_table :invites, id: :uuid do |t|
      t.string :email, null: false
      t.references :inviter, foreign_key: true, null: false, type: :uuid
      t.references :group, foreign_key: true, null: false, type: :uuid
      t.string :first_name
      t.string :last_name
      t.string :locale

      t.timestamps
    end
  end
end
