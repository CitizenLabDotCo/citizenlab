# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InternalCommentOnUnassignedUnmoderatedIdea do
  describe 'InternalCommentOnUnassignedUnmoderatedIdea Campaign default factory' do
    it 'is valid' do
      expect(build(:internal_comment_on_unassigned_unmoderated_idea_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:internal_comment_on_unassigned_unmoderated_idea_campaign) }
    let(:notification) { create(:internal_comment_on_unassigned_unmoderated_idea) }
    let!(:post_image) { create(:idea_image, idea: notification.post) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }
    let(:recipient) { notification_activity.item.recipient }
    let(:name_service) { UserDisplayNameService.new(AppConfiguration.instance, recipient) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
