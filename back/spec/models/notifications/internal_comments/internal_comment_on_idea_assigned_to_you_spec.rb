# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalComments::InternalCommentOnIdeaAssignedToYou do
  describe 'make_notifications_on' do
    let(:assignee) { create(:admin) }
    let(:idea) { create(:idea, assignee: assignee) }
    let(:internal_comment) { create(:internal_comment, post: idea) }

    context 'when an assignee should receive this notification' do
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: assignee.id,
          initiating_user_id: internal_comment.author_id,
          internal_comment_id: internal_comment.id,
          idea_id: idea.id,
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

    context 'when the recipient is the internal comment author' do
      let(:internal_comment) { create(:internal_comment, author: assignee, post: idea) }

      it_behaves_like 'no notification created'
    end

    context "when the internal comment is a comment on the assignee's internal comment" do
      let(:parent_internal_comment) { create(:internal_comment, post: idea, author: assignee) }
      let(:internal_comment) { create(:internal_comment, parent: parent_internal_comment, post: idea) }

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a InternalCommentOnYourInternalComment notification to the recipient.
      it_behaves_like 'no notification created'
    end

    context 'when the internal comment contains a mention of the assignee' do
      let(:internal_comment) do
        create(
          :internal_comment,
          :with_mentions,
          mentioned_users: [assignee],
          post: idea
        )
      end

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a MentionInInternalComment notification to the recipient.
      it_behaves_like 'no notification created'
    end
  end
end
