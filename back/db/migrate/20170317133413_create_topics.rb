class CreateTopics < ActiveRecord::Migration[5.0]
  def change
    create_table :topics, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}
      t.jsonb :description_multiloc, default: {}
      t.string :icon

      t.timestamps
    end
  end
end
