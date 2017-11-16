class CreateIdentities < ActiveRecord::Migration[5.1]
  def change
    create_table :identities, id: :uuid do |t|
      t.string :provider
      t.string :uid
      t.jsonb :auth_hash, default: {}
      t.references :user, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
