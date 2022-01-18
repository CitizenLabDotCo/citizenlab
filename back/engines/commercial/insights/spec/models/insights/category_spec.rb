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
    subject(:category) { create(:category) }

    context 'when its view is deleted' do
      before { category.view.destroy! }

      it { expect { category.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    context 'when it is deleted' do
      it 'gets deleted from zeroshot-classification tasks' do
        task = create(:zsc_task, categories: [category])

        aggregate_failures 'checking task' do
          expect { category.destroy! }.to change { task.categories.count }.by(-1)
          expect(task.reload.categories).not_to include(category)
        end
      end
    end
  end

  describe 'after_save callbacks' do
    let(:category) { build(:category) }

    it { expect { category.save! }.to(change(category.view, :updated_at)) }
  end
end
