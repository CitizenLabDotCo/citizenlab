class CreateAreas < ActiveRecord::Migration[5.0]
  def change
    create_table :areas, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}
      t.jsonb :description_multiloc, default: {}

      t.timestamps
    end
  end
end
