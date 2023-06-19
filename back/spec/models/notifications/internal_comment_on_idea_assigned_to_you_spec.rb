# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalCommentOnIdeaAssignedToYou do
  describe 'make_notifications_on' do
    let(:assignee) { create(:admin) }
    let(:idea) { create(:idea, assignee: assignee) }
    let(:internal_comment) { create(:internal_comment, post: idea) }

    context 'when an assignee should receive this notification' do
      # let(:child_internal_comment) { create(:internal_comment, parent: parent_internal_comment, post: idea) }
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: assignee.id,
          initiating_user_id: internal_comment.author_id,
          post_id: idea.id,
          internal_comment_id: internal_comment.id,
          project_id: internal_comment.post.project_id
        )
      end
    end

    context "when the internal comment is a comment on the assignee's internal comment" do
      let(:parent_internal_comment) { create(:internal_comment, post: idea, author: assignee) }
      let(:child_internal_comment) { create(:internal_comment, parent: parent_internal_comment, post: idea) }

      it 'does not make a notification on created internal comment activity' do
        notifications_count = described_class.count
        activity = create(:activity, item: child_internal_comment, action: 'created')
        notifications = described_class.make_notifications_on activity

        expect(notifications.count).to eq notifications_count
      end
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

      it 'does not make a notification on created internal comment activity' do
        notifications_count = described_class.count
        activity = create(:activity, item: internal_comment, action: 'created')
        notifications = described_class.make_notifications_on activity

        expect(notifications.count).to eq notifications_count
      end
    end
  end
end
