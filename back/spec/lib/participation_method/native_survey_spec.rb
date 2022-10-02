# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::NativeSurvey do
  subject(:participation_method) { described_class.new project }

  let(:project) { create :continuous_native_survey_project }

  describe '#assign_slug' do
    let(:input) { create :input, slug: nil }

    before { create :idea_status_proposed }

    it 'sets and persists the id as the slug of the input' do
      input.update_column :slug, nil
      participation_method.assign_slug(input)
      input.reload
      expect(input.slug).to eq input.id
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create :idea_status_proposed }
      let(:input) { build :idea, publication_status: 'draft', idea_status: nil }

      it 'sets the publication_status to "publised" and the idea_status to "proposed"' do
        participation_method.assign_defaults input
        expect(input.publication_status).to eq 'published'
        expect(input.idea_status).to eq proposed
      end
    end

    context 'when the proposed idea status is not available' do
      let(:input) { build :idea }

      it 'raises ActiveRecord::RecordNotFound' do
        expect { participation_method.assign_defaults input }.to raise_error ActiveRecord::RecordNotFound
      end
    end
  end

  describe '#never_show?' do
    it 'returns true' do
      expect(participation_method.never_show?).to be true
    end
  end

  describe '#never_update?' do
    it 'returns true' do
      expect(participation_method.never_update?).to be true
    end
  end
end
