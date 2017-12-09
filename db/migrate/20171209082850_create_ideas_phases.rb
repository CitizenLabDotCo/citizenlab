class CreateIdeasPhases < ActiveRecord::Migration[5.1]
  def change
    create_table :ideas_phases, id: :uuid do |t|
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.references :phase, foreign_key: true, type: :uuid, index: true

      t.timestamps
    end
  end
end
