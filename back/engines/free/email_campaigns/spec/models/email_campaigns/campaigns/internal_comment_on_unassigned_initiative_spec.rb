# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InternalCommentOnUnassignedInitiative do
  describe 'InternalCommentOnUnassignedInitiative Campaign default factory' do
    it 'is valid' do
      expect(build(:internal_comment_on_unassigned_initiative_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:internal_comment_on_unassigned_initiative_campaign) }
    let(:notification) { create(:internal_comment_on_unassigned_initiative) }
    let!(:post_image) { create(:initiative_image, initiative: notification.post) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
