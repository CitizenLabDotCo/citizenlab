class AddOnboardingToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :onboarding, :jsonb, default: { "topics_and_areas": "ask" }, null: false
  end
end
