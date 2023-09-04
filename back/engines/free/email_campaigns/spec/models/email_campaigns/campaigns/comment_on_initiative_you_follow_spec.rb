# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentOnInitiativeYouFollow do
  describe 'CommentOnYourInitiative Campaign default factory' do
    it 'is valid' do
      expect(build(:comment_on_initiative_you_follow_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:comment_on_initiative_you_follow_campaign) }
    let(:notification) { create(:comment_on_initiative_you_follow) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }
    let(:command) do
      campaign.generate_commands(recipient: notification_activity.item.recipient, activity: notification_activity).first
    end

    it 'generates a command with the desired payload and tracked content' do
      expect(command).to match({
        event_payload: hash_including(
          initiating_user_first_name: notification.initiating_user.first_name,
          initiating_user_last_name: notification.initiating_user.last_name,
          comment_author_name: notification.comment.author.full_name,
          comment_body_multiloc: notification.comment.body_multiloc,
          comment_url: an_instance_of(String),
          post_published_at: an_instance_of(String),
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: notification.post.author.full_name,
          unfollow_url: an_instance_of(String)
        )
      })

      expect(
        command.dig(:event_payload, :initiating_user_first_name)
      ).to eq(notification.initiating_user.first_name)
      expect(
        command.dig(:event_payload, :comment_body_multiloc)
      ).to eq(notification.comment.body_multiloc)
    end

    it 'generates a command with an abbreviated name' do
      SettingsService.new.activate_feature! 'abbreviated_user_names'

      expect(notification.recipient.admin?).to be false
      expect(notification.initiating_user.admin?).to be false

      initial = "#{notification.initiating_user.last_name[0]}."
      expect(command.dig(:event_payload, :initiating_user_last_name)).to eq(initial)
    end
  end
end
