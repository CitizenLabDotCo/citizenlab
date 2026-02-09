# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationLocation do
  subject(:location) { build(:participation_location) }

  it { is_expected.to be_valid }

  describe 'associations' do
    it { is_expected.to belong_to(:trackable) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:trackable) }
    it { is_expected.to validate_inclusion_of(:trackable_type).in_array(described_class::TRACKABLE_TYPES) }
    it { is_expected.to validate_length_of(:country_code).is_equal_to(2).allow_nil }
    it { is_expected.to validate_uniqueness_of(:trackable_id).scoped_to(:trackable_type).case_insensitive }
  end
end
