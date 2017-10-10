class CreateGroups < ActiveRecord::Migration[5.1]
  def change
    create_table :groups, id: :uuid do |t|
      t.jsonb :title_multiloc
      t.string :slug, index: true, unique: true

      t.timestamps
    end
  end
end
