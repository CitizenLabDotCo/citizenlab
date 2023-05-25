# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::ExamplesService do
  let(:service) { described_class.new }

  describe 'save_examples' do
    it 'saves an example when there are no examples yet' do
      recipient = create(:admin)
      campaign = create(:admin_rights_received_campaign)
      command = {
        recipient: recipient,
        event_payload: {}
      }

      expect { service.save_examples([[command, campaign]]) }.to change(EmailCampaigns::Example, :count).from(0).to(1)

      expect(EmailCampaigns::Example.first).to have_attributes(
        campaign_id: campaign.id,
        mail_body_html: kind_of(String),
        locale: 'en',
        subject: 'You became an administrator on the platform of Liege',
        recipient_id: recipient.id
      )
    end

    it 'does not save a new example in case there are 5 recent examples for the campaign' do
      campaign = create(:admin_rights_received_campaign)
      create_list(:campaign_example, 5, campaign: campaign)

      recipient = create(:admin)
      command = {
        recipient: recipient,
        event_payload: {}
      }

      expect { service.save_examples([[command, campaign]]) }.not_to change { EmailCampaigns::Example.all.ids.sort }
    end

    it 'replaces the oldest example if there are less than 5 recent examples for the campaign' do
      campaign = create(:admin_rights_received_campaign)
      recent_examples = create_list(:campaign_example, 3, campaign: campaign)
      old_example = create(:campaign_example, created_at: Time.now - 2.weeks, updated_at: Time.now - 2.weeks, campaign: campaign)
      oldest_example = create(:campaign_example, created_at: Time.now - 3.weeks, updated_at: Time.now - 3.weeks, campaign: campaign)

      recipient = create(:admin)
      command = {
        recipient: recipient,
        event_payload: {}
      }

      expect { service.save_examples([[command, campaign]]) }.to change { EmailCampaigns::Example.all.ids.sort }

      expect(EmailCampaigns::Example.ids).to include(*recent_examples.map(&:id))
      expect(EmailCampaigns::Example.ids).to include(old_example.id)
      expect(EmailCampaigns::Example.ids).not_to include(oldest_example.id)
      expect(EmailCampaigns::Example.where(recipient: recipient).all).to be_present
    end

    it 'does not delete any examples from other campaigns' do
      campaign1 = create(:admin_rights_received_campaign)
      campaign2 = create(:comment_deleted_by_admin_campaign)
      create_list(:campaign_example, 5, campaign: campaign1, created_at: 1.year.ago)
      create(:campaign_example, campaign: campaign2)

      recipient = create(:admin)
      command = {
        recipient: recipient,
        event_payload: {}
      }

      expect { service.save_examples([[command, campaign2]]) }.not_to change { EmailCampaigns::Example.where(campaign: campaign1).count }
    end

    it 'reduces the number of stored campaigns if there are more than EXAMPLES_PER_CAMPAIGN (5)' do
      campaign = create(:admin_rights_received_campaign)
      create_list(:campaign_example, 4, campaign: campaign)
      old_examples = create_list(:campaign_example, 2, created_at: 1.year.ago, campaign: campaign)

      recipient = create(:admin)
      command = {
        recipient: recipient,
        event_payload: {}
      }

      expect { service.save_examples([[command, campaign]]) }.to change(EmailCampaigns::Example, :count).from(6).to(5)
      expect(old_examples.map(&:id) & EmailCampaigns::Example.ids).to be_empty
    end
  end
end
