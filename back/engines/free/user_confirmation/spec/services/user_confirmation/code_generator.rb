require 'rails_helper'

RSpec.describe UserConfirmation::CodeGenerator do
  subject(:result) { described_class.call }

  it 'is successful' do
    expect(result).to be_a_success
  end

  it 'generates a code in the right format (4 digits)' do
    expect(result.code).to match(USER_CONFIRMATION_CODE_PATTERN)
  end

  it 'generates a unique code for each user' do
    codes = create_list(:user, 100).map(&:confirmation_code)
    expect(codes.length).to eq codes.uniq.length
  end
end
