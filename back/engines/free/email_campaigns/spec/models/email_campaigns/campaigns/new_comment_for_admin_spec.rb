# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewCommentForAdmin do
  describe 'NewCommentForAdmin Campaign default factory' do
    it 'is valid' do
      expect(build(:new_comment_for_admin_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:recipient) { create(:user) }
    let(:author) { create(:user, first_name: 'Rea', last_name: 'Xion') }
    let(:comment) { create(:comment, body_multiloc: { 'en' => 'Example comment.' }, author:) }
    let(:campaign) { create(:new_comment_for_admin_campaign) }
    let(:activity) { create(:activity, item: comment, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient:, activity:).first

      expect(command).to match(
        event_payload: a_hash_including(
          initiating_user_first_name: 'Rea',
          comment_author_name: 'Rea Xion',
          comment_body_multiloc: { 'en' => 'Example comment.' },
          comment_url: "http://example.org/en/ideas/#{comment.idea.slug}",
          idea_published_at: comment.idea.published_at.iso8601,
          idea_title_multiloc: comment.idea.title_multiloc,
          idea_author_name: comment.idea.author_name
        )
      )
    end
  end

  describe 'filter_recipient' do
    let(:idea) { create(:idea) }
    let(:author) { create(:user, first_name: 'Rea', last_name: 'Xion') }
    let(:comment) { create(:comment, body_multiloc: { 'en' => 'Example comment.' }, author:, idea:) }
    let(:campaign) { create(:new_comment_for_admin_campaign) }
    let(:activity) { create(:activity, item: comment, action: 'created') }
    let!(:resident) { create(:user) }
    let!(:admin) { create(:admin) }
    let!(:moderator) { create(:project_moderator, projects: [idea.project]) }

    it 'returns moderators only' do
      expect(campaign.filter_recipient(User.all, activity:).ids).to contain_exactly(admin.id, moderator.id)
    end

    context 'when the author is a moderator' do
      let(:author) { create(:project_moderator, projects: [idea.project]) }

      it 'returns no one (empty array)' do
        expect(campaign.filter_recipient(User.all, activity:).ids).to eq []
      end
    end

    context 'when there is no author' do
      let(:author) { nil }

      it 'returns moderators only' do
        expect(campaign.filter_recipient(User.all, activity:).ids).to contain_exactly(admin.id, moderator.id)
      end
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:new_comment_for_admin_campaign) }

    it 'filters out normal users' do
      idea = create(:idea)
      comment = create(:comment, idea: idea)

      _user = create(:user)
      admin = create(:admin)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created)).to contain_exactly(admin)
    end

    it 'filters out everyone if the author is admin' do
      idea = create(:idea)
      comment = create(:comment, idea: idea, author: create(:admin))
      create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: comment, action: 'created')).count).to eq 0
    end

    it 'filters out everyone if the author is moderator' do
      idea = create(:idea)
      moderator = create(:project_moderator, projects: [idea.project])
      comment = create(:comment, idea: idea, author: moderator)
      _admin = create(:admin)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created).count).to eq 0
    end

    it 'keeps moderators' do
      idea = create(:idea)
      comment = create(:comment, idea: idea)

      moderator = create(:project_moderator, projects: [idea.project])
      _other_moderator = create(:project_moderator)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created)).to match([moderator])
    end
  end
end
