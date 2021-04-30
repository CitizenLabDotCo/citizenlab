require 'rails_helper'

RSpec.describe UserConfirmation::ConfirmUser do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }
  let(:user) { create(:user_with_confirmation) }

  before do
    AppConfiguration.instance.activate_feature!('user_confirmation')
    UserConfirmation::SendConfirmationCode.call(user: user)
  end

  context 'when the email confirmation code is correct' do
    before do
      context[:user] = user
      context[:code] = context[:user].email_confirmation_code
    end

    it 'is successful' do
      expect(result).to be_a_success
    end
  end

  context 'when the user is nil' do
    before do
      context[:code] = '1234'
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code blank error' do
      expect(result.errors.details).to include(user: [{ error: :blank }])
    end
  end

  context 'when the code is nil' do
    before do
      context[:user] = user
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code blank error' do
      expect(result.errors.details).to include(code: [{ error: :blank }])
    end
  end

  context 'when the code is incorrect' do
    before do
      context[:user] = user
      context[:code] = 'failcode'
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code invalid error' do
      expect(result.errors.details).to include(code: [{ error: :invalid }])
    end
  end

   context 'when the code has expired' do
    before do
      user.update(email_confirmation_code_sent_at: 1.week.ago)

      context[:user] = user
      context[:code] = user.email_confirmation_code
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code invalid error' do
      expect(result.errors.details).to include(code: [{ error: :expired }])
    end
  end


  context 'when the code has expired and is invalid' do
    before do
      user.update(email_confirmation_code_sent_at: 1.week.ago)

      context[:user] = user
      context[:code] = 'failcode'
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code invalid error' do
      expect(result.errors.details).to include(code: [{ error: :expired }])
    end
  end
end
