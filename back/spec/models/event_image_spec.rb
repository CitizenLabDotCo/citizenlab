# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventImage do
  subject { build(:event_image) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:event) }
  it { is_expected.to validate_presence_of(:event) }
  it { is_expected.not_to validate_presence_of(:ordering) }
  it { is_expected.to validate_numericality_of(:ordering) }
end
