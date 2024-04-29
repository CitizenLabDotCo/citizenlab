# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Sluggable do
  describe do
    let(:sluggable_factories) do
      # It's challenging to define custom models for this spec, as
      # they need to be part of the schema to test well. Instead we
      # reuse existing models for this spec, while still trying to
      # to keep this spec as generic as possible.
      {
        no_slug: :follower,
        slug_from_first_title: :group,
        slug_on_publication: :initiative
      }
    end

    it 'does not set a slug when `slug` is not included in the class' do
      sluggable = create(sluggable_factories[:no_slug])
      expect(sluggable[:slug]).to be_blank
    end

    it 'does not overwrite existing slug' do
      sluggable = create(sluggable_factories[:slug_from_first_title], slug: 'my-slug')
      sluggable.save!

      sluggable.update!(title_multiloc: { en: 'New title' })
      expect(sluggable.slug).to eq 'my-slug'
    end

    it 'does not generate duplicate slugs' do
      title_multiloc = { en: 'Sluggable title' }
      sluggable1 = create(sluggable_factories[:slug_from_first_title], title_multiloc: title_multiloc)
      sluggable2 = create(sluggable_factories[:slug_from_first_title], title_multiloc: title_multiloc)

      expect(sluggable1.slug).not_to eq sluggable2.slug
    end

    it 'does not set a slug when the if-condition is false' do
      sluggable = create(sluggable_factories[:slug_on_publication], publication_status: 'draft')
      expect(sluggable.slug).to be_blank
    end

    it 'sets a slug when the if-condition is true' do
      sluggable = create(sluggable_factories[:slug_on_publication], publication_status: 'published')
      expect(sluggable.slug).to be_present
    end
  end
end
