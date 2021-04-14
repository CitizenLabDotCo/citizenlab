require 'rails_helper'

RSpec.describe UserConfirmation::CheckConfirmationCode do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  context 'when the code is correct' do
    before do
      context[:user] = create(:user)
      context[:code] = context[:user].confirmation_code
    end

    it 'is successful' do
      expect(result).to be_a_success
    end
  end

  context 'when the user is nil' do
    before do
      context[:code] = '123456'
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code.blank error' do
      expect(result.error).to eq 'user.blank'
    end
  end

  context 'when the code is nil' do
    before do
      context[:user] = create(:user)
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code.blank error' do
      expect(result.error).to eq 'code.blank'
    end
  end

  context 'when the code is incorrect' do
    before do
      context[:user] = create(:user)
      context[:code] = 'failcode'
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code.invalid error' do
      expect(result.error).to eq 'code.invalid'
    end
  end
end
