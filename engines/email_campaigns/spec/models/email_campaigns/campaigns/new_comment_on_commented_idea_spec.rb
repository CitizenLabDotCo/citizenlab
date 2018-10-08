require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewCommentOnCommentedIdea, type: :model do
  describe "NewCommentOnCommentedIdea Campaign default factory" do
    it "is valid" do
      expect(build(:new_comment_on_commented_idea_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:new_comment_on_commented_idea_campaign) }
    let(:idea) { create(:idea) }
    let!(:recipient_comment) { create(:comment, idea: idea) }
    let(:initiator_comment) { create(:comment, idea: idea) }
    let(:activity) { create(:activity, item: initiator_comment, action: 'created', user: initiator_comment.author) }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(recipient: recipient_comment.author, activity: activity).first

      expect(command.dig(:event_payload, :comment, :id)).to eq(initiator_comment.id)
  	end
  end
end
