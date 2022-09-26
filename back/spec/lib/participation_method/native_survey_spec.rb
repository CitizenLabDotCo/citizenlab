# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::NativeSurvey do
  subject(:participation_method) { described_class.new project }

  let(:project) { create :continuous_native_survey_project }

  describe '#assign_slug!' do
    context 'when the input has a slug' do
      let(:original_slug) { 'original-slug' }
      let(:input) { build :input, slug: original_slug }

      it 'does not change the slug of the input' do
        expect(input.slug).to eq original_slug
        participation_method.assign_slug!(input)
        expect(input.slug).to eq original_slug
        expect(input).not_to be_persisted
      end
    end

    context 'when the input does not have a slug' do
      let(:input) { create :input, slug: nil }

      it 'sets and persists the id as the slug of the input' do
        input.update_column :slug, nil
        participation_method.assign_slug!(input)
        input.reload
        expect(input.slug).to eq input.id
      end
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
    end
  end

  describe '#assign_default_idea_status' do
    let(:input) { create :idea }

    it 'does not change the input' do
      participation_method.assign_default_idea_status input
      expect(input).not_to be_changed
    end
  end

  describe '#assign_defaults' do
    let!(:proposed) { create :idea_status_proposed }
    let(:input) { build :idea, publication_status: 'draft', idea_status: nil }

    it 'sets the publication_status to "publised" and the idea_status to "proposed"' do
      participation_method.assign_defaults input
      expect(input.publication_status).to eq 'published'
      expect(input.idea_status).to eq proposed
    end
  end
end
