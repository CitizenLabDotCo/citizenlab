# frozen_string_literal: true

# This migration comes from email_campaigns (originally 20230524162712)

class ReplaceCampaignTypeWithCampaignId < ActiveRecord::Migration[6.1]
  def change
    add_column :email_campaigns_examples, :campaign_id, :uuid, null: true, foreign_key: { to_table: 'email_campaigns_campaigns' }
    add_index :email_campaigns_examples, :campaign_id

    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE email_campaigns_examples e
        SET campaign_id = (
          SELECT id
          FROM email_campaigns_campaigns
          WHERE type = e.campaign_class
          LIMIT 1
        )
    SQL

    remove_column :email_campaigns_examples, :campaign_class
  end
end
