# frozen_string_literal: true

require 'rails_helper'

describe Project do
  subject(:project) { build(:project) }

  describe 'associations' do
    it { is_expected.to have_many(:insights_data_sources).dependent(:destroy) }
  end
end
