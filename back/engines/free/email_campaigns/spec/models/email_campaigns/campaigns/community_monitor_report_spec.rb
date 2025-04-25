# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommunityMonitorReport do
  describe 'CommunityMonitorReport Campaign default factory' do
    it { expect(build(:community_monitor_report_campaign)).to be_valid }
  end

  describe '#generate_commands' do
    let(:campaign) { create(:community_monitor_report_campaign) }
    let!(:admin) { create(:admin) }

    it 'generates a command with a URL to community monitor reports' do
      command = campaign.generate_commands(recipient: admin).first
      expect(command[:event_payload]).to eq({
        report_url: 'http://example.org/en/admin/community-monitor/reports'
      })
    end
  end

  describe '#apply_recipient_filters' do
    let(:campaign) { build(:community_monitor_report_campaign) }

    it 'filters out invitees' do
      admin = create(:admin)
      create(:invited_user, roles: [{ type: 'admin' }])
      expect(campaign.apply_recipient_filters).to match_array([admin])
    end

    it 'filters out normal users' do
      admin = create(:admin)
      create(:user)
      expect(campaign.apply_recipient_filters).to match_array([admin])
    end

    it 'filters out moderators of other projects' do
      admin = create(:admin)
      create(:project_moderator)
      expect(campaign.apply_recipient_filters).to match_array([admin])
    end

    it 'includes moderators of community monitor' do
      phase = create(:community_monitor_survey_phase)
      settings = AppConfiguration.instance.settings
      settings['community_monitor'] = { 'enabled' => true, 'allowed' => true, 'project_id' => phase.project_id }
      AppConfiguration.instance.update!(settings:)

      admin = create(:admin)
      moderator = create(:project_moderator, project_ids: [phase.project_id])

      expect(campaign.apply_recipient_filters).to match_array([admin, moderator])
    end
  end

  describe '#content_worth_sending?' do
    let(:campaign) { build(:community_monitor_report_campaign) }
    let!(:phase) { create(:community_monitor_survey_phase) }

    context 'when community monitor not enabled' do
      it 'returns false' do
        SettingsService.new.deactivate_feature! 'community_monitor'
        expect(campaign.send(:content_worth_sending?, {})).to be false
      end
    end

    context 'when community monitor enabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['community_monitor'] = { 'enabled' => true, 'allowed' => true, 'project_id' => phase.project_id }
        AppConfiguration.instance.update!(settings:)
        create(:idea_status_proposed)
      end

      it 'returns false when there are no responses' do
        expect(campaign.send(:content_worth_sending?, {})).to be false
      end

      it 'returns true and creates a new report when there are responses in the previous quarter' do
        travel_to(Date.parse('2025-04-01')) do
          create(:native_survey_response, project: phase.project, creation_phase: phase, published_at: 2.months.ago)
          expect(ReportBuilder::Report.count).to eq 0
          expect(campaign.send(:content_worth_sending?, {})).to be true
          expect(ReportBuilder::Report.count).to eq 1
          expect(ReportBuilder::Report.first.year).to eq 2025
          expect(ReportBuilder::Report.first.quarter).to eq 1
        end
      end

      it 'returns true and does not create a new report if one exists for the previous quarter' do
        travel_to(Date.parse('2025-04-01')) do
          create(:native_survey_response, project: phase.project, creation_phase: phase, published_at: 2.months.ago)
          create(:report, name: 'Existing Community Monitor Report', phase: phase, year: 2025, quarter: 1)
          expect(ReportBuilder::Report.count).to eq 1
          expect(campaign.send(:content_worth_sending?, {})).to be true
          expect(ReportBuilder::Report.count).to eq 1
        end
      end

      it 'returns false when there are only responses in other quarters' do
        travel_to(Date.parse('2025-04-01')) do
          create(:native_survey_response, project: phase.project, creation_phase: phase, published_at: 4.months.ago)
          expect(campaign.send(:content_worth_sending?, {})).to be false
          expect(ReportBuilder::Report.count).to eq 0
        end
      end
    end
  end

  describe '#default_schedule' do
    it 'returns a schedule for the first day of the quarter at 10 AM' do
      expect(described_class.default_schedule.to_s).to eq 'Every 3 months on the 1st day of the month on the 10th hour of the day'
      first_five = described_class.default_schedule.first(5)
      expect(first_five[0].to_date).to eq Date.new(2025, 1, 1)
      expect(first_five[1].to_date).to eq Date.new(2025, 4, 1)
      expect(first_five[2].to_date).to eq Date.new(2025, 7, 1)
      expect(first_five[3].to_date).to eq Date.new(2025, 10, 1)
      expect(first_five[4].to_date).to eq Date.new(2026, 1, 1)
    end
  end
end
