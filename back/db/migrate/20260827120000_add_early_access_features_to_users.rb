# frozen_string_literal: true

class AddEarlyAccessFeaturesToUsers < ActiveRecord::Migration[7.2]
  def change
    # Deliberately left out of the tenant template and project copy user
    # serializers: an opt-in belongs to a person, not to a seeded account.
    add_column :users, :early_access_features, :jsonb, default: [], null: false
  end
end
