# frozen_string_literal: true

class AddOnboardingToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :onboarding, :jsonb, default: {}, null: false
  end
end
