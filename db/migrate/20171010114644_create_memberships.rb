class CreateMemberships < ActiveRecord::Migration[5.1]
  def change
    create_table :memberships, id: :uuid do |t|
      t.references :group, foreign_key: true, type: :uuid, index: true
      t.references :user, foreign_key: true, type: :uuid, index: true
    end
  end
end
