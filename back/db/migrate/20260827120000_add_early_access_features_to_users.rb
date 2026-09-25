# frozen_string_literal: true

class AddEarlyAccessFeaturesToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :early_access_features, :jsonb, default: [], null: false
  end
end
