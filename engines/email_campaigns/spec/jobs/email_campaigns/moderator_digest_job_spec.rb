require 'rails_helper'

RSpec.describe EmailCampaigns::ModeratorDigestJob, type: :job do
  
  subject(:job) { EmailCampaigns::ModeratorDigestJob.new }

  describe '#perform' do

    it "generates an event with the desired content" do
      since = (Time.now - 7.days)

    	project = create(:project)
    	moderator = create(:moderator, project: project)
    	create_list(:idea, 2, published_at: since - 3.days, project: project)
      new_ideas = create_list(:idea, 3, published_at: since + 1.day, project: project)
      other_idea = create(:idea, project: create(:project))
      draft = create(:idea, project: project, publication_status: 'draft')
      create(:vote, votable: new_ideas.first)
      create(:vote, votable: other_idea)
      
      expect(Analytics).to receive(:track) do |event|
      	expect(event[:event]).to eq("Periodic email for moderator digest")
        expect(event[:user_id]).to eq(moderator.id)
        expect(event.dig(:properties, :source)).to eq("cl2-back")
        expect(event.dig(:properties, :tenantId)).to eq(Tenant.current.id)
        expect(event.dig(
          :properties, :payload, :statistics, 
          :activities, :new_ideas, :increase
          )).to eq(new_ideas.size)
        expect(event.dig(
          :properties, :payload, :statistics, 
          :activities, :new_votes, :increase
          )).to eq(1)
        expect(event.dig(:properties, :payload, :top_ideas).map{|ti| ti[:id]}).to include(new_ideas.first.id)
        expect(event.dig(:properties, :payload, :top_ideas).map{|ti| ti[:id]}).not_to include(other_idea.id)
        expect(event.dig(:properties, :payload, :top_ideas).map{|ti| ti[:id]}).not_to include(draft.id)
      end
      job.perform since.to_i
    end

  end
end