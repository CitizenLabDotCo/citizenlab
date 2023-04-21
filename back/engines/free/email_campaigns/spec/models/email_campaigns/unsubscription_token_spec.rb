# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::UnsubscriptionToken do
  describe 'UnsubscriptionToken default factory' do
    it 'is valid' do
      expect(build(:email_campaigns_unsubscription_token)).to be_valid
    end
  end

  describe 'Deleting a user' do
    it 'deletes the associated unsubscription token' do
      token = create(:email_campaigns_unsubscription_token)
      token.user.destroy
      expect { token.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
