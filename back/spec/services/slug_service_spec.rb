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

  describe "slugify" do

    it "retains normal latin chars and numbers" do
      expect(service.slugify("abcaz123")).to eq "abcaz123"
    end

    it "converts uppercase to lowercase" do
      expect(service.slugify("ABCDEabc")).to eq "abcdeabc"
    end

    it "replaces spaces with dashes" do
      expect(service.slugify("this is great")).to eq "this-is-great"
    end

    it "replaces underscores with dashes" do
      expect(service.slugify("this_is_great")).to eq "this-is-great"
    end

    it "ignores prefix or postfix whitespace" do
      expect(service.slugify(" great ")).to eq "great"
    end

    it "removes accents on latin characters when there's at least one normal latin character" do
      expect(service.slugify("gáöüóáàØ")).to eq "gaouoaao"
    end

    it "retains all non-latin characters if there's no normal latin characters" do
      expect(service.slugify("عربى")).to eq "عربى"
    end
  end
end