# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionDate do
  subject { build(:dimension_date) }

  describe 'validations' do
    it { is_expected.to be_valid }
    it { is_expected.to validate_presence_of(:date) }
    it { is_expected.to validate_presence_of(:year) }
    it { is_expected.to validate_presence_of(:month) }
    it { is_expected.to validate_presence_of(:week) }
  end
end
