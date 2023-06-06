# frozen_string_literal: true

class AddInternalCommentsCountToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :internal_comments_count, :integer, null: false, default: 0
  end
end
