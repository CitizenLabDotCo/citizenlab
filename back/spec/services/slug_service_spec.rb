# frozen_string_literal: true

require 'rails_helper'

describe SlugService do
  let(:service) { described_class.new }

  # We call this method from UserSlugService, and we also have specs in UserSlugServiceSpec.
  describe 'generate_slugs' do
    it 'generates unique slugs for unpersisted records when the same field values used for slugs' do
      unpersisted_records = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Jose', last_name: 'Moura')
      ]

      expect(service.generate_slugs(unpersisted_records, &:full_name)).to eq %w[
        jose-moura
        jose-moura-1
      ]
    end

    it 'generates unique slugs when one existing record already has the slug' do
      _persisted_record = create(:user, slug: 'jose-moura')
      unpersisted_records = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Jose', last_name: 'Moura')
      ]

      expect(service.generate_slugs(unpersisted_records, &:full_name)).to eq %w[
        jose-moura-1
        jose-moura-2
      ]
    end

    it 'generates unique slugs when existing records already have the slug' do
      _persisted_records = [
        create(:user, slug: 'jose-moura'),
        create(:user, slug: 'jose-moura-1'),
        create(:user, slug: 'paulo-silva-18')
      ]
      unpersisted_records = [
        build(:user, first_name: 'Jose', last_name: 'Moura'),
        build(:user, first_name: 'Paulo', last_name: 'Silva')
      ]

      expect(service.generate_slugs(unpersisted_records, &:full_name)).to eq %w[
        jose-moura-2
        paulo-silva-19
      ]
    end
  end

  describe 'generate_slug' do
    it 'generates a unique slug when an existing record already has the slug' do
      _persisted_record = create(:user, slug: 'jose')
      unpersisted_record = build(:user, first_name: 'Jose', last_name: nil)

      expect(service.generate_slug(unpersisted_record, unpersisted_record.full_name)).to eq 'jose-1'
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

    it 'removes dots and other special characters' do
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
