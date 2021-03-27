class AddUniqueConstraintToTagging < ActiveRecord::Migration[6.0]
  def change
    add_index :tagging_taggings, [ :idea_id, :tag_id ], :unique => true
  end
end
