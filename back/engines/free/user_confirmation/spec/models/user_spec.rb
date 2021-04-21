require 'rails_helper'

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  it 'is initialized without a confirmation code' do
    expect(user.email_confirmation_code).to be_nil
  end

  it 'sets a confirmation code before saving' do
    user.save
    expect(user.email_confirmation_code).to match USER_CONFIRMATION_CODE_PATTERN
  end

  it 'sets a confirmation code of 4 digits when saving' do
    user.save
    expect(user.email_confirmation_code.length).to eq 4
  end
end
