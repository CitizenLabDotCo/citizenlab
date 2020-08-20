require "rails_helper"

describe UserDisplayNameService do


  before(:all) do
    @regular_user = build(:user, first_name: 'Regular', last_name: 'User')
    @another_user = build(:user, first_name: 'Another', last_name: 'User')
    @admin = build(:admin)
  end

  describe "when shallow anonymization is enabled" do

    before(:all) do
      @tenant = build(:tenant)
      @tenant.settings["display_names"] = {"allowed"=>true, "enabled"=>true}
    end

    it "admins should see full names" do
      name_service = UserDisplayNameService.new(@tenant, @admin)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it "regular users should see their full name" do
      name_service = UserDisplayNameService.new(@tenant, @regular_user)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it "regular users shouldn't not full names of other users" do
      name_service = UserDisplayNameService.new(@tenant, @regular_user)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another U.'
    end
  end

  describe "when shallow anonymization is disabled" do

    before(:all) do
      @tenant = build(:tenant)
      @tenant.settings["display_names"] = {"allowed"=>false, "enabled"=>false}
    end

    it "admins should see full names" do
      name_service = UserDisplayNameService.new(@tenant, @admin)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it "regular users should see full names of other users" do
      name_service = UserDisplayNameService.new(@tenant, @regular_user)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another User'
    end
  end
end