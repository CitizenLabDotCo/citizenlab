# frozen_string_literal: true

class UpdateBasketUserForeignKey < ActiveRecord::Migration[6.1]
  def change
    change_column :baskets, :user_id, :uuid, null: true
  end
end
