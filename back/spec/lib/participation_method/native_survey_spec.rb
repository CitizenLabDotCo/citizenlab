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
      let(:input) { build :input, slug: nil }

      it 'sets and persists the id as the slug of the input' do
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
end
