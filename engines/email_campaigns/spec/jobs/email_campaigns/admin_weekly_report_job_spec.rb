require 'rails_helper'

RSpec.describe EmailCampaigns::AdminWeeklyReportJob, type: :job do
  
  subject(:job) { EmailCampaigns::AdminWeeklyReportJob.new }

  describe '#perform' do

    it "generates an event with the desired content" do
      since = (Time.now - 7.days)

    	admin = create(:admin)
    	create_list(:idea, 2, published_at: since - 3.days)
      new_ideas = create_list(:idea, 3, published_at: since + 1.day)
      create(:vote, votable: new_ideas.first)
      draft = create(:idea, publication_status: 'draft')
      
      expect(Analytics).to receive(:track) do |event|
      	expect(event[:event]).to eq("Periodic email for admin weekly report")
        expect(event[:user_id]).to eq(admin.id)
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
        expect(event.dig(:properties, :payload, :top_project_ideas).map{|tpi| tpi[:top_ideas]}.flatten.map{|ti| ti[:id]}).to include(new_ideas.first.id)
        expect(event.dig(:properties, :payload, :top_project_ideas).map{|tpi| tpi[:top_ideas]}.flatten.map{|ti| ti[:id]}).not_to include(draft.id)
      end
      job.perform since.to_i
    end
    
  end
end