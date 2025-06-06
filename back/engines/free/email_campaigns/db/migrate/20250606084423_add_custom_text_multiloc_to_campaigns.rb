class AddCustomTextMultilocToCampaigns < ActiveRecord::Migration[7.0]
  def change
    add_column :email_campaigns_campaigns, :custom_text_multiloc, :jsonb, default: {}
  end
end
