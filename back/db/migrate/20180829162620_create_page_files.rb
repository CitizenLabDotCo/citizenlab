class CreatePageFiles < ActiveRecord::Migration[5.1]
  def change
    create_table :page_files, id: :uuid do |t|
      t.references :page, foreign_key: true, type: :uuid, index: true
      t.string :file
      t.integer :ordering
      t.string :name

      t.timestamps
    end
  end
end
