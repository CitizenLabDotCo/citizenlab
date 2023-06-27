# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewCommentOnReactedIdea do
  describe 'NewCommentOnReactedIdea Campaign default factory' do
    it 'is valid' do
      expect(build(:new_comment_on_reacted_idea_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:new_comment_on_reacted_idea_campaign) }
    let(:idea) { create(:idea) }
    let!(:reaction) { create(:reaction, reactable: idea) }
    let(:comment) { create(:comment, post: idea) }
    let(:activity) { create(:activity, item: comment, action: 'created', user: comment.author) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: reaction.user, activity: activity).first

      expect(command.dig(:event_payload, :comment_body_multiloc)).to eq(comment.body_multiloc)
    end

    it 'generates a command with an abbreviated name' do
      SettingsService.new.activate_feature! 'abbreviated_user_names'

      expect(reaction.user.admin?).to be false
      expect(comment.author.admin?).to be false

      command = campaign.generate_commands(recipient: reaction.user, activity: activity).first
      initial = "#{comment.author.last_name[0]}."
      expect(command.dig(:event_payload, :initiating_user_last_name)).to eq(initial)
    end
  end
end
