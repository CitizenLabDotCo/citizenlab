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
  end
end
