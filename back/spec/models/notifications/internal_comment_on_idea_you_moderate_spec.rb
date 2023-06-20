# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalCommentOnIdeaYouModerate do
  describe 'make_notifications_on' do
    let(:idea) { create(:idea) }
    let!(:project_moderator) { create(:project_moderator, projects: [idea.project]) }
    let(:internal_comment) { create(:internal_comment, post: idea) }

    context "when recipient is moderator of idea's project and should receive this notification" do
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: project_moderator.id,
          initiating_user_id: internal_comment.author_id,
          post_id: idea.id,
          internal_comment_id: internal_comment.id,
          project_id: internal_comment.post.project_id
        )
      end
    end

    context "when recipient is moderator of idea's project folder and should receive this notification" do
      let(:project) { create(:project) }
      let(:idea2) { create(:idea, project_id: project.id) }
      let(:project_folder) { create(:project_folder, projects: [project]) }
      let!(:project_folder_moderator) { create(:project_folder_moderator, project_folders: [project_folder]) }
      let(:internal_comment) { create(:internal_comment, post: idea2) }
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: project_folder_moderator.id,
          initiating_user_id: internal_comment.author_id,
          post_id: idea2.id,
          internal_comment_id: internal_comment.id,
          project_id: internal_comment.post.project_id
        )
      end
    end

    shared_examples 'no notification created' do
      it 'does not make a notification on created internal comment activity' do
        notifications_count = described_class.count
        activity = create(:activity, item: internal_comment, action: 'created')
        notifications = described_class.make_notifications_on activity

        expect(notifications.count).to eq notifications_count
      end
    end

    context "when the internal comment is a comment on the recipient's internal comment" do
      let(:parent_internal_comment) { create(:internal_comment, post: idea, author: project_moderator) }
      let(:internal_comment) { create(:internal_comment, parent: parent_internal_comment, post: idea) }

      it_behaves_like 'no notification created'
    end

    context 'when the internal comment contains a mention of the recipient' do
      let(:internal_comment) do
        create(
          :internal_comment,
          :with_mentions,
          mentioned_users: [project_moderator],
          post: idea
        )
      end

      it_behaves_like 'no notification created'
    end

    context 'when the internal comment is on an idea the recipient is assigned to' do
      let(:project) { create(:project) }
      let!(:project_moderator) { create(:project_moderator, projects: [project]) }
      let(:idea) { create(:idea, project: project, assignee: project_moderator) }
      let(:internal_comment) { create(:internal_comment, post: idea) }

      it_behaves_like 'no notification created'
    end
  end
end
