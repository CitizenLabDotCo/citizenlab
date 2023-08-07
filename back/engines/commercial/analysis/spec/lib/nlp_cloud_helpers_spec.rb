# frozen_string_literal: true

require 'rails_helper'

describe Analysis::NLPCloudHelpers do
  describe 'LOCALE_MAPPING' do
    subject(:mapping) { described_class::LOCALE_MAPPING }

    it 'contains an entry for all our locales' do
      expect(mapping.keys).to match_array CL2_SUPPORTED_LOCALES.map(&:to_s)
    end
  end
end
