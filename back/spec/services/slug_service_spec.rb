require 'rails_helper'

describe SlugService do
  let(:service) { SlugService.new }

  # We currently don't use this method directly, and we don't create project slugs in bulk, but it's a
  # good example of how the method works.
  # We do call this method from UserSlugService, and we have specs to cover that in UserSlugServiceSpec.
  describe 'generate_slugs' do
    it 'generates unique slugs for unpersisted records with the same field values used for slugs' do
      unpersisted_records = [
        build(:project, title_multiloc: { 'en' => 'A Project' }),
        build(:project, title_multiloc: { 'en' => 'A Project' })
      ]

      expect(service.generate_slugs(unpersisted_records){|r| r.title_multiloc.values.first}).to eq %w[
        a-project
        a-project-1
      ]
    end

    it 'generates unique slugs when one existing record already has the slug' do
      _persisted_record = create(:project, slug: 'a-project')
      unpersisted_records = [
        build(:project, title_multiloc: { 'en' => 'A Project' }),
        build(:project, title_multiloc: { 'en' => 'A Project' })
      ]

      expect(service.generate_slugs(unpersisted_records){|r| r.title_multiloc.values.first}).to eq %w[
        a-project-1
        a-project-2
      ]
    end

    it 'generates unique slugs when existing records already have the slug' do
      _persisted_records = [
        create(:project, slug: 'a-project'),
        create(:project, slug: 'a-project-1'),
        create(:project, slug: 'another-project-18')
      ]
      unpersisted_records = [
        build(:project, title_multiloc: { 'en' => 'A Project' }),
        build(:project, title_multiloc: { 'en' => 'Another Project' })
      ]

      expect(service.generate_slugs(unpersisted_records){|r| r.title_multiloc.values.first}).to eq %w[
        a-project-2
        another-project-19
      ]
    end
  end

  describe 'generate_slug' do
    it 'generates a unique slug when an existing record already has the slug' do
      _persisted_record = create(:project, slug: 'a-project')
      unpersisted_record = build(:project, title_multiloc: { 'en' => 'A Project' })

      expect(service.generate_slug(unpersisted_record, unpersisted_record.title_multiloc.values.first)).to eq 'a-project-1'
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
