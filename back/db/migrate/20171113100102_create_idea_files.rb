class CreateIdeaFiles < ActiveRecord::Migration[5.1]
  def change
    create_table :idea_files, id: :uuid do |t|
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.string :file
      t.integer :ordering
      t.timestamps
    end

    remove_column :ideas, :files
  end
end
