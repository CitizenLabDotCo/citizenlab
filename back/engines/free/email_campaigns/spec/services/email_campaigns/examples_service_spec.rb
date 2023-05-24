# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::ExamplesService do
  let(:service) { described_class.new }

  describe 'save_examples' do
    it 'saves an example when there are no examples yet' do
      recipient = create(:admin)
      campaign = build(:admin_rights_received_campaign)
      command = {
        recipient: recipient,
        event_payload: {},
        activity: create(:admin_rights_given_activity)
      }

      expect { service.save_examples([[command, campaign]]) }.to change(EmailCampaigns::Example, :count).from(0).to(1)

      expect(EmailCampaigns::Example.first).to have_attributes(
        campaign_class: 'EmailCampaigns::Campaigns::AdminRightsReceived',
        mail_body_html: kind_of(String),
        locale: 'en',
        subject: 'You became an administrator on the platform of Liege',
        recipient_id: recipient.id
      )
    end

    it 'does not save a new example in case there are 5 recent examples for the campaign' do
      create_list(:campaign_example, 5)

      recipient = create(:admin)
      campaign = build(:admin_rights_received_campaign)
      command = {
        recipient: recipient,
        event_payload: {},
        activity: create(:admin_rights_given_activity)
      }

      expect { service.save_examples([[command, campaign]]) }.not_to change { EmailCampaigns::Example.all.ids.sort }
    end

    it 'replaces the oldest example if there are less than 5 recent examples for the campaign' do
      recent_examples = create_list(:campaign_example, 3)
      old_example = create(:campaign_example, created_at: Time.now - 2.weeks, updated_at: Time.now - 2.weeks)
      oldest_example = create(:campaign_example, created_at: Time.now - 3.weeks, updated_at: Time.now - 3.weeks)

      recipient = create(:admin)
      campaign = build(:admin_rights_received_campaign)
      command = {
        recipient: recipient,
        event_payload: {},
        activity: create(:admin_rights_given_activity)
      }

      expect { service.save_examples([[command, campaign]]) }.to change { EmailCampaigns::Example.all.ids.sort }

      expect(EmailCampaigns::Example.ids).to include(*recent_examples.map(&:id))
      expect(EmailCampaigns::Example.ids).to include(old_example.id)
      expect(EmailCampaigns::Example.ids).not_to include(oldest_example.id)
      expect(EmailCampaigns::Example.where(recipient: recipient).all).to be_present
    end

    it 'does not delete any examples from other campaigns' do
      other_campaign_examples = create_list(:campaign_example, 5, campaign_class: 'SomeFakeCampaign', created_at: 1.year.ago)
      create(:campaign_example)

      recipient = create(:admin)
      campaign = build(:admin_rights_received_campaign)
      command = {
        recipient: recipient,
        event_payload: {},
        activity: create(:admin_rights_given_activity)
      }

      expect { service.save_examples([[command, campaign]]) }.not_to change { EmailCampaigns::Example.where(campaign_class: 'SomeFakeCampaign').count }
    end

    it 'reduces the number of stored campaigns if there are more than EXAMPLES_PER_CAMPAIGN (5)' do
      create_list(:campaign_example, 4)
      old_examples = create_list(:campaign_example, 2, created_at: 1.year.ago)

      recipient = create(:admin)
      campaign = build(:admin_rights_received_campaign)
      command = {
        recipient: recipient,
        event_payload: {},
        activity: create(:admin_rights_given_activity)
      }

      expect { service.save_examples([[command, campaign]]) }.to change { EmailCampaigns::Example.count }.from(6).to(5)
      expect(old_examples.map(&:id) & EmailCampaigns::Example.ids).to be_empty
    end
  end
end
