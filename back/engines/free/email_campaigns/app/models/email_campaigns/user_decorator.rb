# frozen_string_literal: true

module EmailCampaigns::UserDecorator
  extend ActiveSupport::Concern

  included do
    has_many :authored_campaigns, class_name: 'EmailCampaigns::Campaign', foreign_key: :author_id
    has_many :email_campaigns_deliveries, -> { order(:campaign_id) }, class_name: 'EmailCampaigns::Delivery', dependent: :destroy
    has_many :email_campaigns_consents, class_name: 'EmailCampaigns::Consent', dependent: :destroy
    has_one :email_campaigns_unsubscription_token, class_name: 'EmailCampaigns::UnsubscriptionToken', dependent: :destroy
    has_many :email_campaigns_examples, class_name: 'EmailCampaigns::Example', foreign_key: :recipient_id, dependent: :destroy
    has_many :campaign_email_commands, class_name: 'EmailCampaigns::CampaignEmailCommand', foreign_key: :recipient_id, dependent: :destroy

    before_destroy :fix_authored_campaigns

    def fix_authored_campaigns
      authored_campaigns.where(sender: 'author').update_all(sender: 'organization')
      authored_campaigns.update_all(author_id: nil)
    end
  end
end
