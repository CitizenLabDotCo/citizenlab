# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::Notifications::NotificationSerializer do
  def expect_serializer_to_hide_name(user1, user2, admin, notification_factory_name, serializer_class)
    notification = build(notification_factory_name, initiating_user: user1)
    notification_from_admin = build(notification_factory_name, initiating_user: admin)

    hash = serializer_class.new(notification, params: { current_user: user2 })
    last_name = hash.serializable_hash.dig(:data, :attributes, :initiating_user_last_name)
    slug = hash.serializable_hash.dig(:data, :attributes, :initiating_user_slug)
    expect(last_name).to eq "#{user1.last_name[0]}."
    expect(slug.downcase).not_to include(user1.last_name.downcase)

    last_name = serializer_class
      .new(notification, params: { current_user: user1 })
      .serializable_hash.dig(:data, :attributes, :initiating_user_last_name)
    expect(last_name).to eq user1.last_name

    last_name = serializer_class
      .new(notification, params: { current_user: admin })
      .serializable_hash.dig(:data, :attributes, :initiating_user_last_name)
    expect(last_name).to eq user1.last_name

    last_name = serializer_class
      .new(notification_from_admin, params: { current_user: user2 })
      .serializable_hash.dig(:data, :attributes, :initiating_user_last_name)
    expect(last_name).to eq admin.last_name
  end

  context "with 'abbreviated user names' enabled" do
    before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

    let(:jane) { create(:user, first_name: 'Jane', last_name: 'Doe') }
    let(:john) { create(:user, first_name: 'John', last_name: 'Smith') }
    let(:admin) { create(:admin, first_name: 'Almighty', last_name: 'Admin') }

    it 'serializes CommentOnYourComment correctly' do
      expect_serializer_to_hide_name(
        john, jane, admin, :comment_on_your_comment,
        WebApi::V1::Notifications::CommentOnYourCommentSerializer
      )
    end

    it 'serializes CommentOnIdeaYouFollow correctly' do
      expect_serializer_to_hide_name(
        john, jane, admin, :comment_on_idea_you_follow,
        WebApi::V1::Notifications::CommentOnIdeaYouFollowSerializer
      )
    end

    it 'serializes InitiativeAssignedToYouSerializer correctly' do
      expect_serializer_to_hide_name(
        john, jane, admin, :initiative_assigned_to_you,
        WebApi::V1::Notifications::InitiativeAssignedToYouSerializer
      )
    end

    it 'serializes MentionInComment correctly' do
      expect_serializer_to_hide_name(
        john, jane, admin, :mention_in_comment,
        WebApi::V1::Notifications::MentionInCommentSerializer
      )
    end
  end
end
