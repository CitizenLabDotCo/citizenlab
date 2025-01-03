# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalComments::InternalCommentOnIdeaYouCommentedInternallyOn do
  describe 'make_notifications_on' do
    let(:idea) { create(:idea) }
    let!(:commenter) { create(:admin) }
    let!(:_internal_comment2) { create(:internal_comment, idea: idea, author: commenter) }
    let(:internal_comment) { create(:internal_comment, idea: idea) }

    context 'when admin has internally commented on idea and should receive this notification' do
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: commenter.id,
          initiating_user_id: internal_comment.author_id,
          internal_comment_id: internal_comment.id,
          idea_id: idea.id,
          project_id: internal_comment.idea.project_id
        )
      end
    end

    context "when recipient is moderator, but not of idea's project, and should receive this notification" do
      let(:idea2) { create(:idea) }
      let!(:project_moderator) { create(:project_moderator) }
      let(:internal_comment) { create(:internal_comment, idea: idea2) }
      let!(:_internal_comment2) { create(:internal_comment, idea: idea2, author: project_moderator) }
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: project_moderator.id,
          initiating_user_id: internal_comment.author_id,
          internal_comment_id: internal_comment.id,
          idea_id: idea2.id,
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
      let(:internal_comment) { create(:internal_comment, author: commenter, idea: idea) }

      it_behaves_like 'no notification created'
    end

    context "when the internal comment is a comment on the recipient's internal comment" do
      let(:parent_internal_comment) { create(:internal_comment, idea: idea, author: commenter) }
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
          mentioned_users: [commenter],
          idea: idea
        )
      end

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a MentionInInternalComment notification to the recipient.
      it_behaves_like 'no notification created'
    end

    context 'when the internal comment is on an idea the recipient is assigned to' do
      let(:idea) { create(:idea, assignee: commenter) }

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a InternalCommentOnIdeaAssignedToYou notification to the recipient.
      it_behaves_like 'no notification created'
    end

    context "when recipient is moderator of idea's project" do
      let(:commenter) { create(:project_moderator, projects: [idea.project]) }

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a InternalCommentOnIdeaYouModerate notification to the recipient.
      it_behaves_like 'no notification created'
    end
  end
end
