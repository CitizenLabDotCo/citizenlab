# frozen_string_literal: true

class AddInternalCommentsCounts < ActiveRecord::Migration[6.1]
  def change
    add_column :ideas, :internal_comments_count, :integer, null: false, default: 0
    add_column :initiatives, :internal_comments_count, :integer, null: false, default: 0
  end
end
