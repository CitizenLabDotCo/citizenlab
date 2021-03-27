class CreatePhaseFiles < ActiveRecord::Migration[5.1]
  def change
    create_table :phase_files, id: :uuid do |t|
      t.references :phase, foreign_key: true, type: :uuid, index: true
      t.string :file
      t.integer :ordering

      t.timestamps
    end
  end
end
