# This migration comes from onboarding (originally 20190107130853)
class CreateCampaignDismissals < ActiveRecord::Migration[5.2]
  def change
    create_table :onboarding_campaign_dismissals, id: :uuid do |t|
      t.references :user, type: :uuid
      t.string :campaign_name, null: false
      t.timestamps
    end
  end
end
