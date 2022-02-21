# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::Category do
  subject(:category) { build(:category) }

  describe 'validations' do
    specify { expect(category).to be_valid }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).scoped_to(:view_id) }
    it { is_expected.to validate_inclusion_of(:source_type).in_array(described_class::SOURCE_TYPES).allow_blank }
  end

  describe 'associations' do
    subject(:category) { create(:category) }

    it { is_expected.to belong_to(:view) }
    it { is_expected.to belong_to(:source).optional }
    it { is_expected.to have_many(:assignments).class_name('Insights::CategoryAssignment').dependent(:destroy) }

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
end
