# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::AdminRightsReceived do
  describe 'AdminRightsReceived Campaign default factory' do
    it 'is valid' do
      expect(build(:admin_rights_received_campaign)).to be_valid
    end
  end
end
