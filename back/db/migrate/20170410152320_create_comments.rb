class CreateComments < ActiveRecord::Migration[5.0]
  def change
    create_table :comments, id: :uuid do |t|
      t.references :author, foreign_key: { to_table: :users }, type: :uuid
      t.references :idea, foreign_key: true, type: :uuid
      # t.references :parent, foreign_key: { to_table: :comments }, type: :uuid
      t.uuid :parent_id, :null => true, :index => true
      t.integer :lft, :null => false, :index => true
      t.integer :rgt, :null => false, :index => true
      t.jsonb :body_multiloc, default: {}
      t.string :author_name

      t.timestamps
    end
  end
end
