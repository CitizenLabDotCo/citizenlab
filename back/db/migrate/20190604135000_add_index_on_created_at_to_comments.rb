# frozen_string_literal: true

class AddIndexOnCreatedAtToComments < ActiveRecord::Migration[5.2]
  def change
    add_index(:comments, :created_at)
  end
end
