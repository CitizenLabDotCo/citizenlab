require 'rails_helper'

describe SlugService do
  let(:service) { SlugService.new }
  describe 'generate_user_slugs' do
    it 'generates unique slugs for unpersisted users with the same names' do
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Jose', last_name: 'Moura')
      ]

      service.generate_user_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[
        jose-moura
        jose-moura-1
      ]
    end

    it 'generates unique slugs when one existing user already has the slug' do
      _persisted_user = create(:user, slug: 'jose-moura')
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Jose', last_name: 'Moura')
      ]

      service.generate_user_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[
        jose-moura-1
        jose-moura-2
      ]
    end

    it 'generates unique slugs when existing users already have the slug' do
      _persisted_users = [
        create(:user, slug: 'jose-moura'),
        create(:user, slug: 'jose-moura-1'),
        create(:user, slug: 'paulo-silva-18')
      ]
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Paulo', last_name: 'Silva')
      ]

      service.generate_user_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[
        jose-moura-2
        paulo-silva-19
      ]
    end

    it 'generates unique slugs when existing users already only first names' do
      _persisted_users = [
        create(:user, slug: 'jose'),
      ]
      unpersisted_users = [
        build(:user, first_name: 'Jose', last_name: nil)
      ]

      service.generate_user_slugs unpersisted_users

      expect(unpersisted_users.map(&:slug)).to eq %w[jose-1]
    end
  end

  describe 'slugify' do
    it 'retains normal chars and numbers' do
      expect(service.slugify('abcaz123')).to eq 'abcaz123'
      expect(service.slugify('абвгд123')).to eq 'абвгд123'
    end

    it 'converts uppercase to lowercase' do
      expect(service.slugify('ABCDEabc')).to eq 'abcdeabc'
      expect(service.slugify('АБВГдеёж')).to eq 'абвгдеёж'
    end

    it 'replaces spaces with dashes' do
      expect(service.slugify('this is great')).to eq 'this-is-great'
      expect(service.slugify('это хорошо')).to eq 'это-хорошо'
    end

    it 'replaces underscores with dashes' do
      expect(service.slugify('this_is_great')).to eq 'this-is-great'
      expect(service.slugify('это_хорошо')).to eq 'это-хорошо'
    end

    it 'ignores prefix or postfix whitespace' do
      expect(service.slugify(' great ')).to eq 'great'
      expect(service.slugify(' хорошо ')).to eq 'хорошо'
    end

    it "removes accents on latin characters when there's at least one normal latin character" do
      expect(service.slugify('gáöüóáàØ')).to eq 'gaouoaao'
    end

    it "removes dots and other special characters" do
      expect(service.slugify('this.is.good,?*')).to eq 'this-is-good'
      expect(service.slugify('это.хорошо,?*')).to eq 'это-хорошо'
    end

    it "retains accents on latin characters when there's no normal latin character" do
      expect(service.slugify('áöüóáàØ')).to eq 'áöüóáàø'
    end

    it "retains all non-latin characters if there's no normal latin characters" do
      expect(service.slugify('عربى')).to eq 'عربى'
    end
  end
end
