# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalComments::InternalCommentOnUnassignedUnmoderatedIdea do
  describe 'make_notifications_on' do
    let(:project) { create(:project) }
    let(:project_folder) { create(:project_folder, projects: [project]) }
    let(:idea) { create(:idea, project_id: project.id) }
    let!(:admin) { create(:admin) }
    let(:internal_comment) { create(:internal_comment, idea: idea) }

    context 'when an admin should receive this notification' do
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: admin.id,
          initiating_user_id: internal_comment.author_id,
          idea_id: idea.id,
          internal_comment_id: internal_comment.id,
          project_id: internal_comment.idea.project_id
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

    context 'when the recipient is the internal comment author' do
      let(:internal_comment) { create(:internal_comment, author: admin, idea: idea) }

      it_behaves_like 'no notification created'
    end

    context 'when someone is assigned to the idea' do
      let(:idea) { create(:idea, assignee: create(:admin)) }

      it_behaves_like 'no notification created'
    end

    context "when a moderator of the idea's project exists" do
      let!(:_project_moderator) { create(:project_moderator, projects: [project]) }

      it_behaves_like 'no notification created'
    end

    context "when a moderator of a folder containing the idea's project exists" do
      let!(:project_folder_moderator) { create(:project_folder_moderator, project_folders: [project_folder]) }

      it_behaves_like 'no notification created'
    end

    context "when the internal comment is a comment on the recipient's internal comment" do
      let(:parent_internal_comment) { create(:internal_comment, idea: idea, author: admin) }
      let(:internal_comment) { create(:internal_comment, parent: parent_internal_comment, idea: idea) }

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a InternalCommentOnYourInternalComment notification to the recipient.
      it_behaves_like 'no notification created'
    end

    context 'when the internal comment contains a mention of the recipient' do
      let(:internal_comment) do
        create(
          :internal_comment,
          :with_mentions,
          mentioned_users: [admin],
          idea: idea
        )
      end

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a MentionInInternalComment notification to the recipient.
      it_behaves_like 'no notification created'
    end

    context 'when the recipient has already commented internally on the idea' do
      let!(:_other_internal_comment) { create(:internal_comment, idea: idea, author: admin) }

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a InternalCommentOnIdeaYouCommentedInternallyOn notification to the recipient.
      it_behaves_like 'no notification created'
    end
  end
end
