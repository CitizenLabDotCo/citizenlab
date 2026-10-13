# frozen_string_literal: true

class AddEarlyAccessOptInsToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :early_access_opt_ins, :jsonb, default: [], null: false
  end
end
