# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InviteReceived, type: :model do
  describe 'filter_recipient' do
    let(:invitee) { create(:user, invite_status: 'pending', email: nil, first_name: 'Celia') }
    let(:invite) { create(:invite, invitee_id: invitee.id) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: create(:user)) }

    it 'does not include users without an email' do
      result = described_class.new.filter_recipient(User.all, activity: activity)

      expect(result.to_json).not_to include invitee.first_name
      expect(result.count).to eq 0
    end
  end
end
