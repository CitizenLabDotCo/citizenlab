# frozen_string_literal: true

class AddBlockEndAtToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :block_end_at, :datetime, null: true, default: nil
  end
end
