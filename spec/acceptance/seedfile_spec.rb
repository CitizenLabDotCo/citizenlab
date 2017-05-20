require 'rails_helper'

describe "seedfile" do

  #TODO Refacor this to have separate examples for various assertions. Didn't
  #seem to work the straightforward way after multiple runs, seems to be due to
  #the schema created by apartment for the seedfile tenant. It's not getting
  #deleted after the tests
  it "generates a valid tenant and user" do
    require Rails.root.join("db","seeds.rb")
    expect(Tenant.count).to be(2)
    # 2 and not 1, because the test tenant generated for all tests is also there
    Apartment::Tenant.switch('localhost') do
      expect(User.count).to be 8
      expect(Topic.count).to be > 0
      expect(Area.count).to be > 0
      expect(Project.count).to be > 0
      expect(Phase.count).to be > 0
      expect(Event.count).to be > 0
      expect(Idea.count).to be > 0
      expect(Comment.count).to be > 0
      expect(Page.count).to be 5
    end
  end

end
