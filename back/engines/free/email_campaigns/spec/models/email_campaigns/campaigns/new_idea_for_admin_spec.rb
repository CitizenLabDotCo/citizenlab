# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewIdeaForAdmin, type: :model do
  let(:campaign) { build(:new_idea_for_admin_campaign) }

  describe 'NewIdeaForAdmin Campaign default factory' do
    it { expect(campaign).to be_valid }
  end

  describe 'apply_recipient_filters' do
    it 'filters out normal users' do
      idea = create(:idea)
      create(:user)
      admin = create(:admin)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published)).to eq [admin]
    end

    it 'keeps moderators' do
      idea = create(:idea)
      moderator = create(:project_moderator, projects: [idea.project])
      create(:project_moderator)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published)).to eq([moderator])
    end

    it 'filters out everyone if the author is an admin' do
      project = create(:project)
      admin = create(:admin)
      idea = create(:idea, project: project, author: admin)
      create(:admin)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published).count).to eq 0
    end

    it 'filters out everyone if the author is moderator' do
      project = create(:project)
      moderator = create(:project_moderator, projects: [project])
      idea = create(:idea, project: project, author: moderator)
      create(:admin)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published).count).to eq 0
    end
  end

  describe '#generate_commands' do
    let(:user) { create :user }
    let(:title_multiloc) { { 'en' => 'My awesome idea' } }
    let(:idea) { create :idea, author: user, title_multiloc: title_multiloc }
    let(:activity) { create :activity, item: idea, action: 'published', user: user }
    let(:reciptient) { create :admin }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: reciptient, activity: activity).first

      expect(command.dig(:event_payload, :post_title_multiloc)).to eq title_multiloc
    end

    describe do
      before { IdeaStatus.create_defaults }

      let(:idea) { create :idea, author: user, project: create(:continuous_native_survey_project) }

      it "doesn't get triggered for a native survey response" do
        commands = campaign.generate_commands recipient: user, activity: activity

        expect(commands).to be_empty
      end
    end
  end
end
