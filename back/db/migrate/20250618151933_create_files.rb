class CreateFiles < ActiveRecord::Migration[7.1]
  def change
    create_table :files, id: :uuid do |t|
      t.string :name
      t.string :content
      t.references :uploader, foreign_key: { to_table: :users }, type: :uuid

      t.timestamps
    end
  end
end
