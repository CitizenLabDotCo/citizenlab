# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::MentionInInternalComment do
  describe 'MentionInInternalComment Campaign default factory' do
    it 'is valid' do
      expect(build(:mention_in_internal_comment_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let_it_be(:campaign, reload: true) { create(:mention_in_internal_comment_campaign) }
    let_it_be(:notification, reload: true) { create(:mention_in_internal_comment) }
    let_it_be(:idea_image, reload: true) { create(:idea_image, idea: notification.idea) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
