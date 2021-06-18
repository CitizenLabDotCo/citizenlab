# frozen_string_literal: true

require 'rails_helper'

describe 'Insights::Category' do
  describe 'validations' do
    subject(:category) { build(:category) }

    specify { expect(category).to be_valid }

    it 'is not valid without a name' do
      category.name = nil
      expect(category).not_to be_valid
    end

    it 'is not valid with an empty name' do
      category.name = ''
      expect(category).not_to be_valid
    end

    context 'when category name is already used in the same view' do
      before { create(:category, name: category.name, view: category.view) }

      it { is_expected.not_to be_valid }
    end

    context 'when category name is used in another view' do
      before { create(:category, name: category.name) }

      it { is_expected.to be_valid }
    end
  end

  describe 'associations' do
    context 'when its view is deleted' do
      subject(:category) { create(:category) }

      before { category.view.destroy! }

      it { expect { category.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end

  describe 'after_save callbacks' do
    let(:category) { build(:category) }

    it { expect { category.save! }.to(change(category.view, :updated_at)) }
  end

  describe 'after_destroy callbacks' do
    let(:category) { create(:category) }
    let(:view) { category.view }

    it { expect { category.destroy! }.to(change { view.reload.updated_at }) }
  end
end
