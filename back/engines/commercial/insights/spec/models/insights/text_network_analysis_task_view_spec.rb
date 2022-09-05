# frozen_string_literal: true

require 'rails_helper'

describe Insights::TextNetworkAnalysisTaskView do
  subject(:task_view) { build(:tna_task_view) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:task) }
    it { is_expected.to validate_presence_of(:view) }
    it { is_expected.to validate_presence_of(:language) }
  end
end
