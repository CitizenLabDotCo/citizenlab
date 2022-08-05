# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Ideation do
  subject(:participation_method) { described_class.new project }

  let(:project) { create :continuous_project }

  describe '#assign_slug!' do
    context 'when the input has a slug' do
      let(:original_slug) { 'original-slug' }
      let(:input) { create :idea, slug: original_slug }

      it 'does not change the slug of the input' do
        expect(input.slug).to eq original_slug
        input.title_multiloc = { 'en' => 'Changed title' }
        participation_method.assign_slug!(input)
        expect(input.slug).to eq original_slug
        input.reload
        expect(input.slug).to eq original_slug
      end
    end

    context 'when the input does not have a slug' do
      let(:input) { create :idea }

      it 'sets and persists the slug of the input' do
        input.update_column :slug, nil
        input.title_multiloc = { 'en' => 'Changed title' }
        participation_method.assign_slug!(input)
        input.reload
        expect(input.slug).to eq 'changed-title'
      end
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns true' do
      expect(participation_method.validate_built_in_fields?).to be true
    end
  end
end
