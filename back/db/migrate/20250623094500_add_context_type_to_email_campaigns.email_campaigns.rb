# This migration comes from email_campaigns (originally 20250623094200)
class AddContextTypeToEmailCampaigns < ActiveRecord::Migration[7.1]
  def change
    add_column :email_campaigns_campaigns, :context_type, :string, null: true
    execute <<-SQL.squish
      UPDATE email_campaigns_campaigns
      SET context_type = 'Project'
      WHERE context_id IS NOT NULL;
    SQL
  end
end
