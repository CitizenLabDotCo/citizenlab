class RemoveEnabledDefaultFromCampaigns < ActiveRecord::Migration[5.1]
  def change
    change_column_default :email_campaigns_campaigns, :enabled, nil
  end
end
