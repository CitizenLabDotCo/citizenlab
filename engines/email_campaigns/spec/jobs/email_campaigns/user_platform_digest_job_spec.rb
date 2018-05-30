require 'rails_helper'

RSpec.describe EmailCampaigns::UserPlatformDigestJob, type: :job do
  
  subject(:job) { EmailCampaigns::UserPlatformDigestJob.new }

  describe '#perform' do

    it "generates an event with the desired content" do
      since = (Time.now - 7.days)

      user = create(:user)
    	projects = create_list(:project, 3)
      ideas = create_list(:idea, 10, project: projects.first)
      create_list(:vote, 3, mode: 'up', votable: ideas.first)
      draft_project = create(:project, publication_status: 'draft')
      
      User.where.not(id: user.id).all.each{|u| u.destroy!}
      expect(Analytics).to receive(:track) do |event|
      	expect(event[:event]).to eq("Periodic email for user platform digest")
        expect(event[:user_id]).to eq(user.id)
        expect(event.dig(:properties, :source)).to eq("cl2-back")
        expect(event.dig(:properties, :tenantId)).to eq(Tenant.current.id)
        expect(event.dig(:properties, :payload, :discover_projects).map{|pj| pj.dig(:project, :id)}).to include(projects.first.id)
        expect(event.dig(:properties, :payload, :discover_projects).map{|pj| pj.dig(:project, :id)}).not_to include(draft_project.id)
        expect(event.dig(:properties, :payload, :top_ideas).map{|ti| ti.dig(:idea, :id)}).to include(ideas.first.id)
      end
      job.perform since.to_i
    end
    
  end
end