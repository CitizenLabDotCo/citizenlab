# This migration comes from email_campaigns (originally 20250616150856)
class SplitCustomTextMultilocInCampaigns < ActiveRecord::Migration[7.1]
  def change
    rename_column :email_campaigns_campaigns, :custom_text_multiloc, :title_multiloc
    add_column :email_campaigns_campaigns, :intro_multiloc, :jsonb, default: {}
    add_column :email_campaigns_campaigns, :button_text_multiloc, :jsonb, default: {}
  end
end
