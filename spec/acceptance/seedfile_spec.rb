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
      expect(User.count).to be > 0
      expect(Topic.count).to be > 0
      expect(Area.count).to be > 0
      expect(Project.count).to be > 0
      expect(Phase.count).to be > 0
      expect(Event.count).to be > 0
      expect(Idea.count).to be > 0
      expect(IdeaImage.count).to be > 0
      expect(ProjectImage.count).to be > 0
      expect(Comment.count).to be > 0
      expect(Page.count).to be 12 # 8 generated + 4 legal pages by the template
      expect(Notification.count).to be > 0
      expect(IdeaStatus.count).to be > 0
      expect(Group.count).to be > 0
      expect(CustomField.count).to be > 0
      expect(CustomFieldOption.count).to be > 0
    end
    Apartment::Tenant.switch('empty_localhost') do
      load Rails.root.join("db","seeds.rb")
      expect(User.count).to be 1
      expect(Topic.count).to be > 0
      expect(IdeaStatus.count).to be > 0
      expect(Area.count).to be 0
      expect(Project.count).to be 1
      expect(Phase.count).to be 0
      expect(Event.count).to be 0
      expect(Idea.count).to be 0
      expect(Comment.count).to be 0
      expect(Group.count).to be 0
    end
  end

end
