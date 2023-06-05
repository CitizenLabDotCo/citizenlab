# frozen_string_literal: true

class AddIndexToIdeasAuthorHash < ActiveRecord::Migration[6.1]
  def change
    add_index :ideas, :author_hash
  end
end
