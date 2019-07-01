class CreateInitiatives < ActiveRecord::Migration[5.2]
  def change
    create_table :initiatives, id: :uuid do |t|
      t.jsonb :title_multiloc
      t.jsonb :body_multiloc
      t.string :publication_status
      t.timestamp :published_at
      t.references :author, foreign_key: { to_table: :users }, type: :uuid, index: true
      t.string :author_name
      t.integer :upvotes_count, null: false, default: 0
      t.integer :downvotes_count, null: false, default: 0
      t.st_point :location_point, geographic: true
      t.string :location_description
      t.string :slug
      t.integer :comments_count, null: false, default: 0

      t.timestamps
    end

    # add_index :initiatives, :author_id
    add_index :initiatives, :location_point, using: :gist
    add_index :initiatives, :slug
  end
end
