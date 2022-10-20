# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Ideation do
  subject(:participation_method) { described_class.new project }

  let(:project) { create :continuous_project }

  describe '#assign_slug' do
    let(:input) { create :idea }

    it 'sets and persists the slug of the input' do
      input.update_column :slug, nil
      input.title_multiloc = { 'en' => 'Changed title' }
      participation_method.assign_slug(input)
      input.reload
      expect(input.slug).to eq 'changed-title'
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns true' do
      expect(participation_method.validate_built_in_fields?).to be true
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:proposed) { create :idea_status_proposed }
      let!(:initial_status) { create :idea_status_implemented }

      it 'sets a default "proposed" idea_status if not set' do
        input = build :idea, idea_status: nil
        participation_method.assign_defaults input
        expect(input.idea_status).to eq proposed
      end

      it 'does not change the idea_status if it is already set' do
        initial_status = create :idea_status_implemented
        input = build :idea, idea_status: initial_status
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end

    context 'when the proposed idea status is not available' do
      it 'raises ActiveRecord::RecordNotFound when the idea_status is not set' do
        input = build :idea, idea_status: nil
        expect { participation_method.assign_defaults input }.to raise_error ActiveRecord::RecordNotFound
      end

      it 'does not change the idea_status if it is already set' do
        initial_status = create :idea_status_implemented
        input = build :idea, idea_status: initial_status
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end
  end

  describe '#never_show?' do
    it 'returns false' do
      expect(participation_method.never_show?).to be false
    end
  end

  describe '#never_update?' do
    it 'returns false' do
      expect(participation_method.never_update?).to be false
    end
  end

  describe '#form_in_phase?' do
    it 'returns false' do
      expect(participation_method.form_in_phase?).to be false
    end
  end

  describe '#edit_custom_form_allowed?' do
    it 'returns true' do
      expect(participation_method.edit_custom_form_allowed?).to be true
    end
  end

  describe '#sign_in_required_for_posting?' do
    it 'returns true' do
      expect(participation_method.sign_in_required_for_posting?).to be true
    end
  end

  describe '#extra_fields_category_translation_key' do
    it 'returns the translation key for the extra fields category' do
      expect(participation_method.extra_fields_category_translation_key).to eq 'custom_forms.categories.extra.title'
    end
  end
end
