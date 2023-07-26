# frozen_string_literal: true

class AddBasketIdToNotifications < ActiveRecord::Migration[6.1]
  def change
    add_column :notifications, :basket_id, :uuid, null: true
    add_foreign_key :notifications, :baskets, column: :basket_id
    add_index :notifications, :basket_id
  end
end
