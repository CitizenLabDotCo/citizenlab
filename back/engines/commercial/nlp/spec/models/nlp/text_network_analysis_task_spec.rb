# frozen_string_literal: true

require 'rails_helper'

describe NLP::TextNetworkAnalysisTask do
  subject(:tna_task) { build(:tna_task) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:task_id) }
    it { is_expected.to validate_uniqueness_of(:task_id) }
    it { is_expected.to validate_presence_of(:handler_class) }

    it 'validate that the handler_class constant is defined', :aggregate_failures do
      tna_task.handler_class = 'ImaginaryClass'
      expect(tna_task).not_to be_valid
      expect(tna_task.errors.first.type).to eq('uninitialized constant ImaginaryClass')
    end
  end
end
