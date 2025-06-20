# frozen_string_literal: true

require 'rails_helper'

RSpec.describe File do
  subject { build(:file) }

  it { is_expected.to be_valid }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:content) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:uploader).class_name('User') }
  end
end
