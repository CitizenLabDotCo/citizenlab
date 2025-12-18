# frozen_string_literal: true

class AddTextConfirmationToUser < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :phone_confirmed_at, :datetime, null: true
    add_column :users, :phone_confirmation_code, :string, null: true
    add_column :users, :phone_confirmation_retry_count, :integer, null: false, default: 0
    add_column :users, :phone_confirmation_code_reset_count, :integer, null: false, default: 0
    add_column :users, :phone_confirmation_code_sent_at, :datetime, null: true
  end
end
