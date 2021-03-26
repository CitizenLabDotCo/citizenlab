class CreatePhases < ActiveRecord::Migration[5.0]
  def change
    create_table :phases, id: :uuid do |t|
      t.references :project, foreign_key: true, type: :uuid
      t.jsonb :title_multiloc, default: {}
      t.jsonb :description_multiloc, default: {}
      t.date :start_at
      t.date :end_at

      t.timestamps
    end
  end
end
