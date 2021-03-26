require 'rails_helper'

RSpec.describe GenerateUserAvatarJob, type: :job do
  
  subject(:job) { GenerateUserAvatarJob.new }

  describe '#perform' do

    it "retrieves and stores an avatar when the user has a gravatar for his email address" do
      user = build(:user, email: 'sebastien+withgravatar@citizenlab.co', avatar: nil)
      user.save
      job.perform(user)
      expect(user.reload.avatar).to be_present
    end
  end
end
