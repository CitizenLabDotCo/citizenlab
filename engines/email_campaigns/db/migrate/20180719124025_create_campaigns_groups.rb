class CreateCampaignsGroups < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_campaigns_groups, id: :uuid do |t|
      t.references :campaign, foreign_key: { to_table: :email_campaigns_campaigns }, type: :uuid, index: true
      t.references :group, type: :uuid, index: true
      t.timestamps
      t.index [:campaign_id, :group_id], unique: true, name: :index_campaigns_groups
    end

  end
end
