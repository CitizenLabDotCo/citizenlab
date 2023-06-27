# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::MentionInInternalComment do
  describe 'MentionInInternalComment Campaign default factory' do
    it 'is valid' do
      expect(build(:mention_in_internal_comment_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:mention_in_internal_comment_campaign) }
    let(:notification) { create(:mention_in_internal_comment) }
    let!(:post_image) { create(:idea_image, idea: notification.post) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }
    let(:recipient) { notification_activity.item.recipient }
    let(:name_service) { UserDisplayNameService.new(AppConfiguration.instance, recipient) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
