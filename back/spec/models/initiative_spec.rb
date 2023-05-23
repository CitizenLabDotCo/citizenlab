# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Initiative do
  context 'associations' do
    it { is_expected.to have_many(:votes) }
  end

  context 'Default factory' do
    it 'is valid' do
      # Using create instead of build because it otherwise
      # doesn't have status changes yet which are required
      # by validation.
      expect(create(:initiative)).to be_valid
    end
  end

  context 'hooks' do
    it 'should set the author name on creation' do
      u = create(:user)
      initiative = create(:initiative, author: u)
      expect(initiative.author_name).to eq u.full_name
    end

    it 'should generate a slug on creation' do
      idea = create(:initiative, slug: nil)
      expect(idea.slug).to be_present
    end
  end

  context 'published at' do
    it 'gets set immediately when creating a published idea' do
      t = Time.now
      travel_to t do
        initiative = create(:initiative, publication_status: 'published')
        expect(initiative.published_at.to_i).to eq t.to_i
      end
    end

    it 'stays empty when creating a draft' do
      initiative = create(:initiative, publication_status: 'draft')
      expect(initiative.published_at).to be_nil
    end

    it 'gets filled in when publishing a draft' do
      initiative = create(:initiative, publication_status: 'draft')
      t = Time.now + 1.week
      travel_to t do
        initiative.update(publication_status: 'published')
        expect(initiative.published_at.to_i).to eq t.to_i
      end
    end

    it "doesn't change again when already published once" do
      t = Time.now
      travel_to t
      initiative = create(:initiative, publication_status: 'published')
      travel_to t + 1.week
      initiative.update(publication_status: 'closed')
      travel_to t + 1.week
      initiative.update(publication_status: 'published')
      expect(initiative.published_at.to_i).to eq t.to_i
      travel_back
    end
  end

  describe 'body sanitizer' do
    it 'sanitizes script tags in the body' do
      initiative = create(:initiative, body_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(initiative.body_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end
  end

  describe 'title' do
    it 'is stripped from spaces at beginning and ending' do
      initiative = create(:initiative, title_multiloc: { 'en' => ' my fantastic idea  ' })
      expect(initiative.title_multiloc['en']).to eq 'my fantastic idea'
    end
  end

  describe 'slug' do
    it 'is set properly upon publication' do
      i1 = create(:initiative, title_multiloc: nil, slug: nil, publication_status: 'draft')
      i1.update!(title_multiloc: { 'en' => 'My stupendous idea' }, publication_status: 'published')
      expect(i1.slug).to be_present

      i2 = create(:initiative, title_multiloc: nil, slug: nil, publication_status: 'draft')
      i2.update!(title_multiloc: { 'en' => 'My sublime idea' }, publication_status: 'published')
      expect(i1.slug).to be_present
    end
  end

  describe 'order_status' do
    it 'shows proposed initiatives first, where the ones which will soon expire are shown at the top' do
      proposed = create(:initiative_status_proposed)
      threshold_reached = create(:initiative_status_threshold_reached)
      i1, i2, i3 = create_list(:initiative, 3)
      i1.update! published_at: (Time.now - 3.minutes)
      create(
        :initiative_status_change,
        initiative: i1, initiative_status: proposed
      )
      create(
        :initiative_status_change,
        initiative: i2, initiative_status: proposed
      )
      create(
        :initiative_status_change,
        initiative: i3, initiative_status: threshold_reached
      )
      expect(described_class.order_status.ids).to eq [i1.id, i2.id, i3.id]
    end
  end

  describe 'anonymous participation' do
    let(:author) { create(:user) }

    it 'has an author hash of consistent length' do
      initiative = create(:initiative)
      expect(initiative.author_hash.length).to eq 32
    end

    context 'ideas are not anonymous' do
      it 'has the same author hash on each initiative when the author is the same' do
        initiative1 = create(:initiative, author: author)
        initiative2 = create(:initiative, author: author)
        expect(initiative1.author_hash).to eq initiative2.author_hash
      end
    end

    context 'initiatives are anonymous' do
      it 'has no author if set to anonymous' do
        initiative = create(:initiative, anonymous: true)
        expect(initiative.author).to be_nil
      end

      it 'has the same author hash on each initiative when the anonymous author is the same' do
        initiative1 = create(:initiative, author: author, anonymous: true)
        initiative2 = create(:initiative, author: author, anonymous: true)
        expect(initiative1.author_hash).to eq initiative2.author_hash
      end

      it 'has a different author hash for initiatives when one initiative is anonymous and the other is not' do
        initiative1 = create(:initiative, author: author)
        initiative2 = create(:initiative, author: author, anonymous: true)
        expect(initiative1.author_hash).not_to eq initiative2.author_hash
      end
    end

    context 'updating initiatives' do
      it 'can publish an anonymous initiative' do
        initiative = create(:initiative, publication_status: 'draft', anonymous: true)
        initiative.update!(publication_status: 'published')
        expect(initiative.author).to be_nil
      end

      it 'deletes the author if anonymous is updated' do
        initiative = create(:initiative)
        initiative.update!(anonymous: true)
        expect(initiative.author).to be_nil
      end

      it 'sets anonymous to false and changes the author hash if an author is supplied on update' do
        initiative = create(:idea, anonymous: true)
        old_initiative_hash = initiative.author_hash
        initiative.update!(author: author)
        expect(initiative.author).not_to be_nil
        expect(initiative.anonymous).to be false
        expect(initiative.author_hash).not_to eq old_initiative_hash
      end

      it 'generates a different author_hash if the author changes' do
        initiative = create(:idea)
        old_initiative_hash = initiative.author_hash
        initiative.update!(author: author)
        expect(initiative.author_hash).not_to eq old_initiative_hash
      end
    end
  end
end
