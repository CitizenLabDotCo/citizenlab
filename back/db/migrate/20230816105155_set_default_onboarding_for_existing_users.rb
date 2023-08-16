class SetDefaultOnboardingForExistingUsers < ActiveRecord::Migration[7.0]
  def up
    User.where(onboarding: nil).update_all(onboarding: { "topics_and_areas": "ask" })
  end
end
