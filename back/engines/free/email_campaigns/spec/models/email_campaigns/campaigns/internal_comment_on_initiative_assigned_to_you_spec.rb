# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InternalCommentOnInitiativeAssignedToYou do
  describe 'InternalCommentOnInitiativeAssignedToYou Campaign default factory' do
    it 'is valid' do
      expect(build(:internal_comment_on_initiative_assigned_to_you_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:internal_comment_on_initiative_assigned_to_you_campaign) }
    let(:notification) { create(:internal_comment_on_initiative_assigned_to_you) }
    let!(:post_image) { create(:initiative_image, initiative: notification.post) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
