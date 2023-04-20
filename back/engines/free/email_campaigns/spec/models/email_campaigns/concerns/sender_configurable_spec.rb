# frozen_string_literal: true

require 'rails_helper'

class SenderConfigurableCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::SenderConfigurable
end

RSpec.describe EmailCampaigns::SenderConfigurable do
  let(:campaign) { SenderConfigurableCampaignForTest.new }

  describe 'validations' do
    it 'is invalid when the campaign is sent from the autor and has no author' do
      campaign.sender = 'author'
      campaign.author = nil
      expect(campaign).to be_invalid
    end

    it 'is valid when the campaign is sent from the author and has an author' do
      campaign.sender = 'author'
      campaign.author = create(:user)
      expect(campaign).to be_valid
    end
  end
end
