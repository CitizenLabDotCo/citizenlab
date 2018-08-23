require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ModeratorDigest, type: :model do
  describe "ModeratorDigest Campaign default factory" do
    it "is valid" do
      expect(build(:moderator_digest_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:moderator_digest_campaign) }
    let!(:project) { create(:project) }
  	let!(:moderator) { create(:moderator, project: project) }
    let!(:old_ideas) { create_list(:idea, 2, project: project, published_at: Time.now - 20.days) }
    let!(:new_ideas) { create_list(:idea, 3, project: project, published_at: Time.now - 1.day) }
    let!(:vote) { create(:vote, mode: 'up', votable: new_ideas.first) }
    let!(:other_idea) { create(:idea, project: create(:project)) }
    let!(:draft) { create(:idea, project: project, publication_status: 'draft') }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_command recipient: moderator
      
      expect(
      	command.dig(:event_payload, :statistics, :activities, :new_ideas, :increase)
      	).to eq(new_ideas.size)
      expect(
      	command.dig(:event_payload, :statistics, :activities, :new_votes, :increase)
      	).to eq(1)
      expect(
      	command.dig(:event_payload, :top_ideas).map{|ti| ti[:id]}
      	).to include(new_ideas.first.id)
      expect(
      	command.dig(:event_payload, :top_ideas).map{|ti| ti[:id]}
      	).not_to include(draft.id)
      expect(
        command.dig(:event_payload, :top_ideas).map{|ti| ti[:id]}
        ).not_to include(other_idea.id)
      expect(command.dig(:tracked_content, :idea_ids)).to include(new_ideas.first.id)
  	end
  end
end
