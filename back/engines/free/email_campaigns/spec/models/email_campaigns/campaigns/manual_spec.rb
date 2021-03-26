require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::Manual, type: :model do
  describe "Manual Campaign default factory" do
    it "is valid" do
      expect(build(:manual_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do

    let(:campaign) { create(:manual_campaign) }
    let(:recipient) { create(:user) }
    it "generates a command with the desired payload" do
      expect(campaign.generate_commands(recipient: recipient)&.first).to match({
        author: campaign.author,
        event_payload: {},
        subject_multiloc: campaign.subject_multiloc,
        body_multiloc: campaign.body_multiloc,
        sender: campaign.sender,
        reply_to: campaign.reply_to
      })
    end
  end

  describe "apply_recipient_filters" do
    let(:campaign) { build(:manual_campaign) }

    it "filters out invitees" do
      user = create(:user)
      invitee = create(:invited_user)

      expect(campaign.apply_recipient_filters).to include(user)
      expect(campaign.apply_recipient_filters).not_to include(invitee)
    end
  end

  describe "author" do
    let(:campaign) { create(:manual_campaign, author: create(:admin)) }

    it "leaves campaign in a valid state after destroy" do
      campaign.author.destroy!
      expect(campaign.reload).to be_valid
    end
  end

end
