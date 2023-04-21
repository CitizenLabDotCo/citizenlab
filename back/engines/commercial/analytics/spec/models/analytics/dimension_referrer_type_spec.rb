# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionReferrerType do
  subject { build(:dimension_referrer_type) }

  describe 'validations' do
    it { is_expected.to be_valid }
    it { is_expected.to validate_presence_of(:key) }
    it { is_expected.to validate_uniqueness_of(:key) }
  end
end
