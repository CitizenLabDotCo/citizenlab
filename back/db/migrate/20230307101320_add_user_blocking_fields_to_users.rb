# frozen_string_literal: true

class AddUserBlockingFieldsToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :block_start_at, :datetime, null: true, default: nil
    add_column :users, :block_reason, :string, null: true, default: nil
  end
end
