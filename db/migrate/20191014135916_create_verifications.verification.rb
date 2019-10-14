# This migration comes from verification (originally 20191014135520)
class CreateVerifications < ActiveRecord::Migration[5.2]
  def change
    create_table :verification_verifications, id: :uuid do |t|
      t.references :user, type: :uuid, index: true
      t.string :method_name, null: false
      t.string :hashed_uid, index: true, null: false
      t.boolean :active, null: false, default: true

      t.timestamps
    end
  end
end
