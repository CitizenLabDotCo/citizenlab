class CreateEvents < ActiveRecord::Migration[5.0]
  def change
    create_table :events, id: :uuid do |t|
      t.references :project, foreign_key: true, type: :uuid
      t.jsonb :title_multiloc, default: {}
      t.jsonb :description_multiloc, default: {}
      t.json :location_multiloc, default: {}
      t.datetime :start_at
      t.datetime :end_at

      t.timestamps
    end
  end
end
