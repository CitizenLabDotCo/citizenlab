require "rails_helper"

describe UserDisplayNameService do


  before(:all) do
    @regular_user = build(:user, first_name: 'Regular', last_name: 'User')
    @another_user = build(:user, first_name: 'Another', last_name: 'User')
    @admin = build(:admin, first_name: "Almighty", last_name: "Admin")
  end

  context "when 'abbreviated_user_names' is enabled" do

    before(:all) do
      @app_configuration = build(:app_configuration)
      @app_configuration.settings["abbreviated_user_names"] = {"allowed" => true, "enabled" => true}
    end

    it "admins should see full names" do
      name_service = UserDisplayNameService.new(@app_configuration, @admin)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it "regular users should see their full name" do
      name_service = UserDisplayNameService.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it "regular users shouldn't not full names of other users" do
      name_service = UserDisplayNameService.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another U.'
    end

    it "unknown users shouldn't see full names" do
      name_service = UserDisplayNameService.new(@app_configuration, nil)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another U.'
    end

    it "unknown and regular users should see the full name of admins" do
      name_service = UserDisplayNameService.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@admin)
      expect(display_name).to eq 'Almighty Admin'

      name_service = UserDisplayNameService.new(@app_configuration, nil)
      display_name = name_service.display_name(@admin)
      expect(display_name).to eq 'Almighty Admin'
    end
  end

  context "when 'abbreviated_user_names' is disabled" do

    before(:all) do
      @app_configuration = build(:app_configuration)
      @app_configuration.settings["abbreviated_user_names"] = {"allowed" => false, "enabled" => false}
    end

    it "admins should see full names" do
      name_service = UserDisplayNameService.new(@app_configuration, @admin)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it "regular users should see full names of other users" do
      name_service = UserDisplayNameService.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another User'
    end
  end
end