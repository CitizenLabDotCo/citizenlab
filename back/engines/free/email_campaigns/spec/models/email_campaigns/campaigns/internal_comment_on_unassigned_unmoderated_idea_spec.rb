# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InternalCommentOnUnassignedUnmoderatedIdea do
  describe 'InternalCommentOnUnassignedUnmoderatedIdea Campaign default factory' do
    it 'is valid' do
      expect(build(:internal_comment_on_unassigned_unmoderated_idea_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let_it_be(:campaign, reload: true) { create(:internal_comment_on_unassigned_unmoderated_idea_campaign) }
    let_it_be(:notification, reload: true) { create(:internal_comment_on_unassigned_unmoderated_idea) }
    let_it_be(:idea_image, reload: true) { create(:idea_image, idea: notification.idea) }

    include_examples 'internal_comment_campaign_generate_commands'
  end
end
