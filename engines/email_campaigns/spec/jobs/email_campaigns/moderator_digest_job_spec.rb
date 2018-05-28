require 'rails_helper'

RSpec.describe EmailCampaigns::ModeratorDigestJob, type: :job do
  
  subject(:job) { EmailCampaigns::ModeratorDigestJob.new }

  describe '#perform' do

    it "generates an event with properties and stuff" do
    	project = create(:project)
    	moderator = create(:moderator, project: project)
    	create_list(:idea, 5)
      
      expect(Analytics).to receive(:track) do |event|
      	expect(event[:event]).to eq("Periodic email for moderator digest")
      end
      job.perform((Time.now - 7.days).to_i)
    end
  end
end