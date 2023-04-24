# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionLocale do
  subject { build(:dimension_locale) }

  describe 'validations' do
    it { is_expected.to be_valid }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
  end
end
