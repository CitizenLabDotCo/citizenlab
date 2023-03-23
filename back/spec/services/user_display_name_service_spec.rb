# frozen_string_literal: true

require 'rails_helper'

describe UserDisplayNameService do
  before(:all) do
    @regular_user = build(:user, first_name: 'Regular', last_name: 'User')
    @another_user = build(:user, first_name: 'Another', last_name: 'User')
    @admin = build(:admin, first_name: 'Almighty', last_name: 'Admin')
  end

  context "when 'abbreviated_user_names' is enabled" do
    before(:all) do
      @app_configuration = build(:app_configuration)
      @app_configuration.settings['abbreviated_user_names'] = { 'allowed' => true, 'enabled' => true }
    end

    it 'admins should see full names' do
      name_service = described_class.new(@app_configuration, @admin)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it 'regular users should see their full name' do
      name_service = described_class.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it "regular users shouldn't not full names of other users" do
      name_service = described_class.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another U.'
    end

    it "unknown users shouldn't see full names" do
      name_service = described_class.new(@app_configuration, nil)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another U.'
    end

    it 'unknown and regular users should see the full name of admins' do
      name_service = described_class.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@admin)
      expect(display_name).to eq 'Almighty Admin'

      name_service = described_class.new(@app_configuration, nil)
      display_name = name_service.display_name(@admin)
      expect(display_name).to eq 'Almighty Admin'
    end
  end

  context "when 'abbreviated_user_names' is disabled" do
    before(:all) do
      @app_configuration = build(:app_configuration)
      @app_configuration.settings['abbreviated_user_names'] = { 'allowed' => false, 'enabled' => false }
    end

    it 'admins should see full names' do
      name_service = described_class.new(@app_configuration, @admin)
      display_name = name_service.display_name(@regular_user)
      expect(display_name).to eq 'Regular User'
    end

    it 'regular users should see full names of other users' do
      name_service = described_class.new(@app_configuration, @regular_user)
      display_name = name_service.display_name(@another_user)
      expect(display_name).to eq 'Another User'
    end
  end

  context 'when users have no first or last name' do
    let(:no_name_user) { build(:user, first_name: nil, last_name: nil) }
    let(:name_service) { described_class.new(@app_configuration, @admin) }

    it 'returns a fake first name and 6 figure numeric last name' do
      expect(name_service.first_name(no_name_user)).to eq 'User'
      expect(name_service.last_name(no_name_user)).to match(/\d{6}/)
    end

    it 'always returns the same 6 figure value for last_name given the same email' do
      first_value = name_service.last_name(no_name_user)
      expect(name_service.last_name(no_name_user)).to match(/\d{6}/)
      expect(name_service.last_name(no_name_user)).to eq first_value
    end

    it 'does not return fake names if first_name is set' do
      no_name_user.update(first_name: 'Bob')
      expect(name_service.first_name(no_name_user)).to eq 'Bob'
      expect(name_service.last_name(no_name_user)).to be_nil
    end

    it 'does not return fake names if last_name is set' do
      no_name_user.update(last_name: 'Smith')
      expect(name_service.first_name(no_name_user)).to be_nil
      expect(name_service.last_name(no_name_user)).to eq 'Smith'
    end

    it 'does not return fake names if invite is pending' do
      no_name_user.update(invite_status: 'pending')
      expect(name_service.first_name(no_name_user)).to be_nil
      expect(name_service.last_name(no_name_user)).to be_nil
    end
  end
end
