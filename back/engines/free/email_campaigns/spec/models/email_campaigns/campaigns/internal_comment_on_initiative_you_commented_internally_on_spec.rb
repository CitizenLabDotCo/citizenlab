# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InternalCommentOnInitiativeYouCommentedInternallyOn do
  describe 'InternalCommentOnInitiativeYouCommentedInternallyOn Campaign default factory' do
    it 'is valid' do
      expect(build(:internal_comment_on_initiative_you_commented_internally_on_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:internal_comment_on_initiative_you_commented_internally_on_campaign) }
    let(:notification) { create(:internal_comment_on_initiative_you_commented_internally_on) }
    let!(:post_image) { create(:initiative_image, initiative: notification.post) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
