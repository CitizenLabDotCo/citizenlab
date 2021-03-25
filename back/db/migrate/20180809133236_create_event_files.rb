class CreateEventFiles < ActiveRecord::Migration[5.1]
  def change
    create_table :event_files, id: :uuid do |t|
      t.references :event, foreign_key: true, type: :uuid, index: true
      t.string :file
      t.integer :ordering

      t.timestamps
    end
  end
end
