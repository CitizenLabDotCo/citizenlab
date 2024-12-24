# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalComments::InternalCommentOnYourInternalComment do
  describe 'make_notifications_on' do
    let(:idea) { create(:idea) }
    let(:parent_internal_comment) { create(:internal_comment, post: idea) }

    context 'when the internal comment does not contain a mention of the parent author' do
      let(:child_internal_comment) { create(:internal_comment, parent: parent_internal_comment, post: idea) }
      let(:activity) { create(:activity, item: child_internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: parent_internal_comment.author_id,
          initiating_user_id: child_internal_comment.author_id,
          internal_comment_id: child_internal_comment.id,
          idea_id: parent_internal_comment.post_id,
          project_id: parent_internal_comment.post.project_id
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
      let(:parent_author) { parent_internal_comment.author }
      let(:internal_comment) do
        create(
          :internal_comment,
          author: parent_internal_comment.author,
          parent: parent_internal_comment,
          post: idea
        )
      end

      it_behaves_like 'no notification created'
    end

    context 'when the internal comment contains a mention of the parent author' do
      let(:parent_author) { parent_internal_comment.author }
      let(:internal_comment) do
        create(
          :internal_comment,
          :with_mentions,
          mentioned_users: [parent_author],
          parent: parent_internal_comment,
          post: idea
        )
      end

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a MentionInInternalComment notification to the recipient.
      it_behaves_like 'no notification created'
    end
  end
end
