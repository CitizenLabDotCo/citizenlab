# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ScreeningDigest do
  let_it_be(:prescreening_status) { create(:idea_status, code: 'prescreening') }
  let_it_be(:campaign) { create(:screening_digest_campaign) }

  describe 'ScreeningDigest Campaign default factory' do
    it { expect(campaign).to be_valid }
  end

  describe '#generate_commands' do
    let_it_be(:project1) { create(:single_phase_ideation_project) }
    let_it_be(:project2) { create(:single_phase_ideation_project) }

    context 'when there are ideas awaiting screening' do
      before_all do
        create_list(:idea, 3, project: project1, idea_status: prescreening_status, publication_status: 'submitted')
        create_list(:idea, 2, project: project2, idea_status: prescreening_status, publication_status: 'submitted')
        create(:idea, project: project1) # published idea, should not be counted
      end

      context 'when recipient is an admin' do
        let(:admin) { create(:admin) }

        it 'generates a command with total screening count across all projects' do
          command = campaign.generate_commands(recipient: admin).sole

          expect(command.dig(:event_payload, :screening_count)).to eq(5)
          expect(command.dig(:event_payload, :screening_url)).to include('status=', 'tab=statuses')
        end
      end

      context 'when recipient is a project moderator' do
        let(:moderator) { create(:project_moderator, projects: [project1]) }

        it 'only counts inputs from moderated projects' do
          command = campaign.generate_commands(recipient: moderator).sole

          expect(command.dig(:event_payload, :screening_count)).to eq(3)
          expect(command.dig(:event_payload, :screening_url)).to include('status=', 'tab=statuses')
        end
      end
    end

    context 'when there are no ideas awaiting screening' do
      let(:admin) { create(:admin) }

      before { create(:idea, project: project1) }

      it 'returns an empty array' do
        expect(campaign.generate_commands(recipient: admin)).to be_empty
      end
    end
  end

  describe 'apply_recipient_filters' do
    subject(:recipients) { campaign.apply_recipient_filters }

    let!(:admin) { create(:admin) }
    let!(:invited_admin) { create(:invited_user, roles: [{ type: 'admin' }]) }
    let!(:moderator) { create(:project_moderator) }
    let!(:user) { create(:user) }

    it { is_expected.to contain_exactly(admin, moderator) }
  end

  describe 'content_worth_sending?' do
    it 'returns false when no ideas awaiting screening' do
      create(:idea)
      expect(campaign.send(:content_worth_sending?, {})).to be false
    end

    it 'returns true when there are ideas awaiting screening' do
      create(:idea, idea_status: prescreening_status, publication_status: 'submitted')
      expect(campaign.send(:content_worth_sending?, {})).to be true
    end
  end
end
