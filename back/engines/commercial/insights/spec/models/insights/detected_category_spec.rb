# frozen_string_literal: true

require 'rails_helper'

describe 'Insights::DetectedCategory' do
  describe 'validations' do
    subject(:detected_category) { build(:detected_category) }

    specify { expect(detected_category).to be_valid }

    it 'is not valid without a name' do
      detected_category.name = nil
      expect(detected_category).not_to be_valid
    end

    it 'is not valid with an empty name' do
      detected_category.name = ''
      expect(detected_category).not_to be_valid
    end

    context 'when detected_category name is already used in the same view' do
      before { create(:detected_category, name: detected_category.name, view: detected_category.view) }

      it { is_expected.not_to be_valid }
    end

    context 'when detected_category name is used in another view' do
      before { create(:detected_category, name: detected_category.name) }

      it { is_expected.to be_valid }
    end
  end

  describe 'associations' do
    subject(:detected_category) { create(:detected_category) }

    context 'when its view is deleted' do
      before { detected_category.view.destroy! }

      it { expect { detected_category.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end
end
