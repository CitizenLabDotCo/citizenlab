# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ScreeningDigest do
  describe 'ScreeningDigest Campaign default factory' do
    it { expect(build(:screening_digest_campaign)).to be_valid }
  end

  describe '#generate_commands' do
    let(:campaign) { create(:screening_digest_campaign) }
    let!(:prescreening_status) { create(:idea_status, code: 'prescreening') }
    let(:project) { create(:single_phase_ideation_project) }

    context 'when recipient is an admin' do
      let(:admin) { create(:admin) }
      let(:project2) { create(:single_phase_ideation_project) }

      let!(:screening_ideas_project1) do
        create_list(:idea, 3, project: project, idea_status: prescreening_status, publication_status: 'submitted')
      end
      let!(:screening_ideas_project2) do
        create_list(:idea, 2, project: project2, idea_status: prescreening_status, publication_status: 'submitted')
      end
      let!(:published_idea) { create(:idea, project: project) }

      it 'generates a command with all projects' do
        command = campaign.generate_commands(recipient: admin).first

        expect(command).to be_present
        expect(command.dig(:event_payload, :total_screening_count)).to eq(5)
        expect(command.dig(:event_payload, :projects).length).to eq(2)
        expect(command.dig(:event_payload, :screening_overview_url)).to include('status=')
        expect(command.dig(:event_payload, :screening_overview_url)).to include('tab=statuses')
      end

      it 'sorts projects by screening count descending' do
        command = campaign.generate_commands(recipient: admin).first

        expect(command.dig(:event_payload, :projects).first[:screening_count]).to eq(3)
        expect(command.dig(:event_payload, :projects).second[:screening_count]).to eq(2)
      end
    end

    context 'when recipient is a project moderator' do
      let(:moderator) { create(:project_moderator, projects: [project]) }

      let!(:screening_ideas) do
        create_list(:idea, 3, project: project, idea_status: prescreening_status, publication_status: 'submitted')
      end
      let!(:published_idea) { create(:idea, project: project) }

      it 'generates a command with only moderated projects' do
        command = campaign.generate_commands(recipient: moderator).first

        expect(command).to be_present
        expect(command.dig(:event_payload, :total_screening_count)).to eq(3)
        expect(command.dig(:event_payload, :projects).length).to eq(1)
        expect(command.dig(:event_payload, :projects).first[:project_id]).to eq(project.id)
        expect(command.dig(:event_payload, :projects).first[:screening_count]).to eq(3)
        expect(command.dig(:event_payload, :projects).first[:screening_url]).to include('status=')
        expect(command.dig(:event_payload, :projects).first[:screening_url]).to include('tab=statuses')
      end

      context 'when ideas are in a project the moderator does not moderate' do
        let(:other_project) { create(:single_phase_ideation_project) }
        let!(:other_screening_ideas) do
          create_list(:idea, 3, project: other_project, idea_status: prescreening_status, publication_status: 'submitted')
        end

        it 'excludes projects the moderator does not moderate' do
          command = campaign.generate_commands(recipient: moderator).first

          project_ids = command.dig(:event_payload, :projects).map { |p| p[:project_id] }
          expect(project_ids).to contain_exactly(project.id)
          expect(project_ids).not_to include(other_project.id)
        end
      end
    end

    context 'when there are no ideas awaiting screening' do
      let(:admin) { create(:admin) }
      let!(:published_idea) { create(:idea, project: project) }

      it 'returns an empty array' do
        commands = campaign.generate_commands(recipient: admin)
        expect(commands).to be_empty
      end
    end

    context 'when moderator has multiple projects with screening inputs' do
      let(:project2) { create(:single_phase_ideation_project) }
      let(:moderator_multiple) { create(:project_moderator, projects: [project, project2]) }
      let!(:screening_ideas_project1) do
        create_list(:idea, 2, project: project, idea_status: prescreening_status, publication_status: 'submitted')
      end
      let!(:screening_ideas_project2) do
        create_list(:idea, 5, project: project2, idea_status: prescreening_status, publication_status: 'submitted')
      end

      it 'includes all moderated projects and sorts by count descending' do
        command = campaign.generate_commands(recipient: moderator_multiple).first

        expect(command.dig(:event_payload, :total_screening_count)).to eq(7)
        expect(command.dig(:event_payload, :projects).length).to eq(2)
        expect(command.dig(:event_payload, :projects).first[:screening_count]).to eq(5)
        expect(command.dig(:event_payload, :projects).second[:screening_count]).to eq(2)
      end
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:screening_digest_campaign) }
    let(:project) { create(:single_phase_ideation_project) }

    it 'includes admins' do
      admin = create(:admin)

      expect(campaign.apply_recipient_filters).to include(admin)
    end

    it 'includes project moderators' do
      moderator = create(:project_moderator, projects: [project])

      expect(campaign.apply_recipient_filters).to include(moderator)
    end

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
  end

  describe 'content_worth_sending?' do
    let(:campaign) { build(:screening_digest_campaign) }
    let!(:prescreening_status) { create(:idea_status, code: 'prescreening') }
    let(:project) { create(:single_phase_ideation_project) }

    it 'returns false when no ideas awaiting screening' do
      create(:idea, project: project)
      expect(campaign.send(:content_worth_sending?, {})).to be false
    end

    it 'returns true when there are ideas awaiting screening' do
      create(:idea, project: project, idea_status: prescreening_status, publication_status: 'submitted')
      expect(campaign.send(:content_worth_sending?, {})).to be true
    end
  end
end
