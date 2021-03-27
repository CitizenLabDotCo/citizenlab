class RemoveNotNullConstraintForSlugFromIdeas < ActiveRecord::Migration[5.2]
  def change
    change_column_null :ideas, :slug, true
  end
end
