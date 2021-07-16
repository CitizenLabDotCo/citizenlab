# frozen_string_literal: true

require 'rails_helper'

describe 'Insights::ProcessedFlag' do
  describe 'validations' do
    subject(:processed_flag) { build(:processed_flag) }

    specify { expect(processed_flag).to be_valid }

    it 'is not valid without an input' do
      processed_flag.input = nil
      expect(processed_flag).not_to be_valid
    end

    it 'is not valid without a view' do
      processed_flag.input = nil
      expect(processed_flag).not_to be_valid
    end

    it 'cannot have duplicates' do
      processed_flag.clone.save!

      aggregate_failures(' checking processed_flag is invalid ') do
        expect(processed_flag).not_to be_valid
        expect(processed_flag.errors.messages).to match({ input_id: ['Flag already exists'] })
      end
    end
  end

  describe 'associations' do
    context 'when associated input is deleted' do
      subject(:processed_flag) { create(:processed_flag) }

      before { processed_flag.input.destroy! }

      it { expect { processed_flag.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end
    context 'when associated view is deleted' do
      subject(:processed_flag) { create(:processed_flag) }

      before { processed_flag.view.destroy! }

      it { expect { processed_flag.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end
end
