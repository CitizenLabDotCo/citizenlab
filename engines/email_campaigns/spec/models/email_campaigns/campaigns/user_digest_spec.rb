require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::UserDigest, type: :model do
  describe "UserDigest Campaign default factory" do
    it "is valid" do
      expect(build(:user_digest_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
  	let(:campaign) { create(:user_digest_campaign) }
  	let!(:user) { create(:user) }
    let!(:new_project) { create(:project, created_at: Time.now - 1.day) }
    let!(:projects) { create_list(:project, 2, created_at: Time.now - 5.days) + [new_project] }
    let!(:top_idea) { create(:idea, project: new_project, published_at: Time.now - 1.hour) }
    let!(:ideas) { create_list(:idea, 10, project: new_project, published_at: Time.now - 2.hours) }
    let!(:votes) { create_list(:vote, 3, mode: 'up', votable: top_idea) + [top_idea] }
    let!(:top_comment) { create(:comment, idea: top_idea, created_at: Time.now - 3.minutes) }
    let!(:comments) { create_list(:comment, 3, idea: top_idea, parent: top_comment) + create_list(:comment, 5, idea: top_idea) + [top_comment] }
    let!(:votes) { create_list(:vote, 3, mode: 'up', votable: top_idea) + [top_idea] }
    let!(:draft_project) { create(:project, publication_status: 'draft', created_at: Time.now - 2.minutes) }

  	it "generates a command with the desired payload and tracked content" do
  		command = campaign.generate_commands(recipient: user).first

      expect(
      	command.dig(:event_payload, :discover_projects).map{|pj| pj[:created_at]}
      	).to include(new_project.created_at.iso8601)
      expect(
        command.dig(:event_payload, :discover_projects).map{|pj| pj[:created_at]}
        ).not_to include(draft_project.created_at.iso8601)
      expect(
        command.dig(:event_payload, :top_ideas).first[:published_at]
        ).to eq(top_idea.published_at.iso8601)
      expect(
        command.dig(:event_payload, :top_ideas).first[:top_comments].first[:created_at]
        ).to eq(top_comment.created_at.iso8601)
  	end
  end
end
