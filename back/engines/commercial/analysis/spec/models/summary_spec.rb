# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::Summary do
  subject { summary }

  let(:summary) { build(:summary) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end
end
