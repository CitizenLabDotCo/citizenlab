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

  it { is_expected.to(allow_value('123456').for(:email_confirmation_code)) }
  it { is_expected.not_to(allow_value('asdasa').for(:email_confirmation_code)) }
  it { is_expected.not_to(allow_value(nil).for(:email_confirmation_code)) }
end
