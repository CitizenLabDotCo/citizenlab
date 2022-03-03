# frozen_string_literal: true

require 'rails_helper'

describe Insights::DataSource do
  subject(:data_source) { build(:data_source) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:view) }
    it { is_expected.to validate_presence_of(:origin) }
    it { is_expected.to validate_inclusion_of(:origin_type).in_array(described_class::ORIGIN_TYPES) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:view) }
    it { is_expected.to belong_to(:origin) }
  end
end
