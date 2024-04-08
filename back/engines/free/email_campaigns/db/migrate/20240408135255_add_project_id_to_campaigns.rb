class AddProjectIdToCampaigns < ActiveRecord::Migration[7.0]
  def change
    add_reference :email_campaigns_campaigns, :project, foreign_key: true, type: :uuid
  end
end
