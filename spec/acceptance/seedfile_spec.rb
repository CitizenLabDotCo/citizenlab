require 'rails_helper'


describe "seedfile", slow_test: true do

  #TODO Refacor this to have separate examples for various assertions. Didn't
  #seem to work the straightforward way after multiple runs, seems to be due to
  #the schema created by apartment for the seedfile tenant. It's not getting
  #deleted after the tests
  it "generates a valid tenant and user" do
    expect(Tenant.count).to be(1)
    load Rails.root.join("db","seeds.rb")
    expect(Tenant.count).to be(3)
    Apartment::Tenant.switch('localhost') do
      load Rails.root.join("db","seeds.rb")
      # The default tenant has a locked id to make it easier for other related
      # projects to have seeddata that works out of the box with cl2-back
      expect(Tenant.current.id).to eq "c72c5211-8e03-470b-9564-04ec0a8c322b"
      expect(User.count).to be > 0
      expect(User.find_by(email: 'admin@citizenlab.co').id).to eq "386d255e-2ff1-4192-8e50-b3022576be50"
      expect(User.find_by(email: 'moderator@citizenlab.co').id).to eq "61caabce-f7e5-4804-b9df-36d7d7d73e4d"
      expect(User.find_by(email: 'user@citizenlab.co').id).to eq "546335a3-33b9-471c-a18a-d5b58ebf173a"
      expect(Topic.count).to be > 0
      expect(Area.count).to be > 0
      expect(Project.count).to be > 0
      expect(Event.count).to be >= 4
      expect(Idea.count).to be > 0
      expect(IdeaImage.count).to be > 0
      expect(ProjectImage.count).to be > 0
      expect(Comment.count).to be > 0
      expect(Page.count).to be 17 # 8 generated + 5 legal pages + 1 initiatives + 3 success stories
      expect(IdeaStatus.count).to be > 0
      expect(Group.count).to be > 0
      expect(CustomField.with_resource_type('User').count).to be > 0
      expect(CustomFieldOption.count).to be > 0
      expect(CustomField.with_resource_type('CustomForm').count).to be > 0
      expect(Invite.count).to be > 0
      expect(Verification::IdCard.count).to be 10
      expect(EmailCampaigns::UnsubscriptionToken.count).to be > 0
      expect(Maps::MapConfig.count).to be 1
      expect(Maps::Layer.count).to be 2
      expect(Maps::LegendItem.count).to be 7
      expect(Volunteering::Cause.count).to be 5
      expect(Volunteering::Volunteer.count).to be > 10
    end
    Apartment::Tenant.switch('empty_localhost') do
      load Rails.root.join("db","seeds.rb")
      expect(User.count).to be 1
      expect(Topic.count).to be > 0
      expect(IdeaStatus.count).to be > 0
      expect(Area.count).to be 0
      expect(Project.count).to be 1
      expect(Phase.count).to be 0
      expect(Event.count).to be 4
      expect(Idea.count).to be 0
      expect(Comment.count).to be 0
      expect(Group.count).to be 0
    end
  end

end
