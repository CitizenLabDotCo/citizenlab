# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Volunteering do
  subject(:participation_method) { described_class.new project }

  let(:input) { create :idea }
  let(:project) { create :continuous_project }

  describe '#assign_slug' do
    it 'does not change the input' do
      participation_method.assign_slug input
      expect(input).not_to be_changed
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
    end
  end

  describe '#assign_defaults' do
    it 'does not change the input' do
      participation_method.assign_defaults input
      expect(input).not_to be_changed
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
