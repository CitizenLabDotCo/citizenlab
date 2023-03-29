# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InviteReceived, type: :model do
  describe 'filter_recipient' do
    let(:invitee) { create(:user, invite_status: 'pending', email: nil, first_name: 'Celia') }
    let(:invite) { create(:invite, invitee_id: invitee.id) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: create(:user)) }

    it 'excludes users with pending invite and no email' do
      result = described_class.new.filter_recipient(User.all, activity: activity)

      expect(result.to_json).not_to include invitee.first_name
      expect(result.count).to eq 0
    end

    it 'includes users with pending invite and with an email' do
      invitee.update(email: 'valid@g.com')
      result = described_class.new.filter_recipient(User.all, activity: activity)

      expect(result.to_json).to include invitee.first_name
      expect(result.count).to eq 1
    end
  end
end
