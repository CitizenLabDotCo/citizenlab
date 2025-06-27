# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectImage do
  subject { create(:project_image) }

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:project_image)).to be_valid
    end
  end

  it { is_expected.to belong_to(:project) }
  it { is_expected.to validate_presence_of(:project) }
  it { is_expected.not_to validate_presence_of(:ordering) }
  it { is_expected.to validate_numericality_of(:ordering) }
end
