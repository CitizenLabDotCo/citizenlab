require 'rails_helper'

RSpec.describe EmailCampaigns::ModeratorDigestJob, type: :job do
  
  subject(:job) { EmailCampaigns::ModeratorDigestJob.new }

  describe '#perform' do

    it "generates an event with properties and stuff" do
      # add stuff
      job.perform((Time.now - 7.days).to_i)
      expect(2).to eq(3)
    end
  end
end