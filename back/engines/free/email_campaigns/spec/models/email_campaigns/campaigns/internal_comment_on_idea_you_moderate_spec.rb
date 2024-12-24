# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InternalCommentOnIdeaYouModerate do
  describe 'InternalCommentOnIdeaYouModerate Campaign default factory' do
    it 'is valid' do
      expect(build(:internal_comment_on_idea_you_moderate_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:internal_comment_on_idea_you_moderate_campaign) }
    let(:notification) { create(:internal_comment_on_idea_you_moderate) }
    let!(:post_image) { create(:idea_image, idea: notification.idea) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
