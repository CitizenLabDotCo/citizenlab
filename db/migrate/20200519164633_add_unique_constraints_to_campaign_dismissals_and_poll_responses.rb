class AddUniqueConstraintsToCampaignDismissalsAndPollResponses < ActiveRecord::Migration[6.0]
  def change
    add_index :polls_responses, [:participation_context_id, :participation_context_type, :user_id], unique: true, name: 'index_polls_responses_on_participation_context_and_user_id'
    add_index :onboarding_campaign_dismissals, [:campaign_name, :user_id], unique: true, name: 'index_dismissals_on_campaign_name_and_user_id'
  end
end
