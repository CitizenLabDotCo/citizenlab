# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ImpactTracking::Pageview do
  subject { build(:pageview) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end
end
