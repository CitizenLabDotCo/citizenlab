require 'rails_helper'

describe SlugService do
  let(:service) { SlugService.new }
  describe "generate_slugs" do
    it "generates unique slugs for unpersisted users with the same names" do
      unpersisted_users = [
        build(:user, first_name: 'jose'),
        build(:user, first_name: 'jose'),
      ]
      expect(service.generate_slugs(unpersisted_users, &:first_name)).to eq [
        'jose',
        'jose-1',
      ]
    end

    it "generates unique slugs when one existing user already has the slug" do
      persisted_user = create(:user, slug: 'jose')
      unpersisted_users = [
        build(:user, first_name: 'jose'),
        build(:user, first_name: 'jose'),
      ]
      expect(service.generate_slugs(unpersisted_users, &:first_name)).to eq [
        'jose-1',
        'jose-2',
      ]
    end

    it "generates unique slugs when existing users already have the slug" do
      persisted_users = [
        create(:user, slug: 'jose'),
        create(:user, slug: 'jose-1'),
        create(:user, slug: 'paulo-18'),
      ]
      unpersisted_users = [
        build(:user, first_name: 'jose'),
        build(:user, first_name: 'paulo'),
      ]
      expect(service.generate_slugs(unpersisted_users, &:first_name)).to eq [
        'jose-2',
        'paulo-19'
      ]
    end

  end
end