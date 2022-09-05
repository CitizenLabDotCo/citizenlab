# frozen_string_literal: true

require 'rails_helper'

describe Insights::TextNetwork do
  subject(:text_network) { build(:insights_text_network) }

  describe 'factory' do
    specify { is_expected.to be_valid }
  end

  describe 'validation' do
    it { is_expected.to validate_presence_of(:language) }
    it { is_expected.to validate_presence_of(:json_network) }
    it { is_expected.to validate_presence_of(:view) }
    it { is_expected.to validate_uniqueness_of(:language).scoped_to(:view_id) }
  end
end
