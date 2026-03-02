class CreateSpaces < ActiveRecord::Migration[7.2]
  def change
    create_table :spaces, id: :uuid do |t|
      t.jsonb :title_multiloc, null: false, default: {}
      t.jsonb :description_multiloc, null: false, default: {}
      t.timestamps
    end
  end
end
