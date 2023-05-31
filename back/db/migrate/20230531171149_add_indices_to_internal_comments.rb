# frozen_string_literal: true

class AddIndicesToInternalComments < ActiveRecord::Migration[6.1]
  def change
    add_index :internal_comments, :created_at
    add_index :internal_comments, :post_id
  end
end
