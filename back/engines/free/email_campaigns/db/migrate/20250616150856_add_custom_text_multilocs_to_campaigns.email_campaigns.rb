class AddCustomTextMultilocsToCampaigns < ActiveRecord::Migration[7.1]
  def change
    add_column :email_campaigns_campaigns, :title_multiloc, :jsonb, default: {}
    add_column :email_campaigns_campaigns, :intro_multiloc, :jsonb, default: {}
    add_column :email_campaigns_campaigns, :button_text_multiloc, :jsonb, default: {}
  end
end
