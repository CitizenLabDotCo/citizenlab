class RenameTaggingTables < ActiveRecord::Migration[6.0]
  def change
    rename_table :tags, :tagging_tags
    rename_table :tag_assignments, :tagging_taggings
  end
end
