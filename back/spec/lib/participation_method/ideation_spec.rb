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

  describe '#assign_default_idea_status' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create :idea_status_proposed }
      let!(:initial_status) { create :idea_status_implemented }

      it 'sets a default "proposed" idea_status if not set' do
        input = build :idea, idea_status: nil
        participation_method.assign_default_idea_status input
        expect(input.idea_status).to eq proposed
      end

      it 'does not change the idea_status if it is already set' do
        initial_status = create :idea_status_implemented
        input = build :idea, idea_status: initial_status
        participation_method.assign_default_idea_status input
        expect(input.idea_status).to eq initial_status
      end
    end

    context 'when the proposed idea status is not available' do
      it 'raises a ActiveRecord::RecordNotFound when the idea_status is not set' do
        input = build :idea, idea_status: nil
        expect { participation_method.assign_default_idea_status input }.to raise_error ActiveRecord::RecordNotFound
      end

      it 'does not change the idea_status if it is already set' do
        initial_status = create :idea_status_implemented
        input = build :idea, idea_status: initial_status
        participation_method.assign_default_idea_status input
        expect(input.idea_status).to eq initial_status
      end
    end
  end

  describe '#assign_defaults' do
    let(:input) { create :idea }

    it 'does not change the input' do
      participation_method.assign_defaults input
      expect(input).not_to be_changed
    end
  end
end
