# frozen_string_literal: true

class CreateInternalComments < ActiveRecord::Migration[6.1]
  def change
    create_table :internal_comments, id: :uuid do |t|
      t.references :author, foreign_key: { to_table: :users }, type: :uuid
      t.references :post, polymorphic: true, type: :uuid
      t.uuid :parent_id, null: true, index: true
      t.integer :lft, null: false, index: true
      t.integer :rgt, null: false, index: true
      t.jsonb :body_multiloc, default: {}
      t.string :publication_status, null: false, default: 'published'
      t.datetime :body_updated_at, null: true
      t.integer :children_count, null: false, default: 0

      t.timestamps
    end
  end
end
