class AddSourceToCategories < ActiveRecord::Migration[6.1]
  def change
    add_reference :insights_categories, :source, polymorphic: true, type: :uuid, index: true
    add_index :insights_categories, [:source_type]
  end
end
