# frozen_string_literal: true

class AddInternalCommentsCountToIdeas < ActiveRecord::Migration[6.1]
  def change
    add_column :ideas, :internal_comments_count, :integer, null: false, default: 0
  end
end
