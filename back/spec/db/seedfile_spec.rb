require 'rails_helper'


describe "seedfile", slow_test: true do
  if !CitizenLab.ee?
    it "generates a valid app configuration, user and initial data" do
      AppConfiguration.first.destroy!

      load Rails.root.join("db","seeds.rb")
      expect(AppConfiguration.count).to be(1)
        
      expect(User.admin.count).to be > 0
      expect(StaticPage.count).to be > 3
      expect(IdeaStatus.count).to be > 0
      expect(InitiativeStatus.count).to be > 0
      expect(Topic.count).to be > 0
      expect(Project.count).to be > 0
      expect(ProjectImage.count).to be > 0
      expect(ProjectsAllowedInputTopic.count).to be > 0

      expect(EmailCampaigns::UnsubscriptionToken.count).to be > 0
      expect(EmailCampaigns::Campaign.count).to be > 0
    end
  end

end
