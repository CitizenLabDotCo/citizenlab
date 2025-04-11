# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommunityMonitorReport do
  describe 'CommunityMonitorReport Campaign default factory' do
    it { expect(build(:community_monitor_report_campaign)).to be_valid }
  end

  describe '#generate_commands' do
    let(:campaign) { create(:community_monitor_report_campaign) }
    let!(:admin) { create(:admin) }

    it 'generates a command with an empty payload' do
      command = campaign.generate_commands(recipient: admin).first
      expect(command[:event_payload]).to eq({})
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:admin_digest_campaign) }

    it 'filters out invitees' do
      admin = create(:admin)
      create(:invited_user, roles: [{ type: 'admin' }])
      expect(campaign.apply_recipient_filters).to match([admin])
    end

    it 'filters out normal users' do
      admin = create(:admin)
      create(:user)
      expect(campaign.apply_recipient_filters).to match([admin])
    end

    it 'filters out moderators of other projects' do
      admin = create(:admin)
      create(:project_moderator)
      expect(campaign.apply_recipient_filters).to match([admin])
    end

    it 'includes moderators of community monitor' do
      # TODO: JS
    end
  end

  describe 'content_worth_sending?' do
    let(:campaign) { build(:admin_digest_campaign) }
    let!(:phase) { create(:community_monitor_survey_phase) }

    context 'when community monitor not enabled' do
      it 'returns false' do
        SettingsService.new.deactivate_feature! 'community_monitor'
        expect(campaign.send(:content_worth_sending?, {})).to be false
      end
    end

    context 'when community monitor enabled' do
      it 'returns false when there are no responses' do
        expect(campaign.send(:content_worth_sending?, {})).to be false
      end

      it 'returns true when there are responses in the previous quarter' do
        #   TODO: JS
      end

      it 'returns false when there are only responses in other quarters' do
        # TODO: JS
      end
    end
  end
end
