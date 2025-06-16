# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ImpactTracking::Session do
  subject { build(:session) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to have_many(:pageviews).dependent(:destroy) }
end
