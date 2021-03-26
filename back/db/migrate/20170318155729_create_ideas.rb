class CreateIdeas < ActiveRecord::Migration[5.0]
  def change
    create_table :ideas, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}
      t.jsonb :body_multiloc, default: {}
      t.string :publication_status
      t.datetime :published_at
      t.references :project, foreign_key: true, type: :uuid
      t.references :author, foreign_key: { to_table: :users }, type: :uuid
      t.string :author_name
      t.jsonb :images
      t.jsonb :files

      t.timestamps
    end
  end
end
