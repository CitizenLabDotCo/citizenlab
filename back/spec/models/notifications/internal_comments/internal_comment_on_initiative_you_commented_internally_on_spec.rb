# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalComments::InternalCommentOnInitiativeYouCommentedInternallyOn do
  describe 'make_notifications_on' do
    let(:initiative) { create(:initiative) }
    let!(:commenter) { create(:admin) }
    let!(:_internal_comment2) { create(:internal_comment, post: initiative, author: commenter) }
    let(:internal_comment) { create(:internal_comment, post: initiative) }

    context 'when admin has internally commented on initiative and should receive this notification' do
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: commenter.id,
          initiating_user_id: internal_comment.author_id,
          internal_comment_id: internal_comment.id,
          post_id: initiative.id,
          post_type: 'Initiative',
          project_id: nil
        )
      end
    end

    context 'when recipient is moderator and should receive this notification' do
      let(:initiative2) { create(:initiative) }
      let!(:project_moderator) { create(:project_moderator) }
      let(:internal_comment) { create(:internal_comment, post: initiative2) }
      let!(:_internal_comment2) { create(:internal_comment, post: initiative2, author: project_moderator) }
      let(:activity) { create(:activity, item: internal_comment, action: 'created') }

      it 'makes a notification on created internal comment activity' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: project_moderator.id,
          initiating_user_id: internal_comment.author_id,
          internal_comment_id: internal_comment.id,
          post_id: initiative2.id,
          post_type: 'Initiative',
          project_id: nil
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
      let(:internal_comment) { create(:internal_comment, author: commenter, post: initiative) }

      it_behaves_like 'no notification created'
    end

    context "when the internal comment is a comment on the recipient's internal comment" do
      let(:parent_internal_comment) { create(:internal_comment, post: initiative, author: commenter) }
      let(:internal_comment) { create(:internal_comment, parent: parent_internal_comment, post: initiative) }

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
          post: initiative
        )
      end

      # Don't create this notification if the Activity (internal comment created)
      # should lead to a MentionInInternalComment notification to the recipient.
      it_behaves_like 'no notification created'
    end
  end
end
