# This migration comes from email_campaigns (originally 20181022092448)
class RemoveEnabledDefaultFromCampaigns < ActiveRecord::Migration[5.1]
  def change
    change_column_default :email_campaigns_campaigns, :enabled, nil
  end
end
