class CreateTags < ActiveRecord::Migration[5.0]
  def change
    create_table :tags, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}

      t.timestamps
    end
  end
end
