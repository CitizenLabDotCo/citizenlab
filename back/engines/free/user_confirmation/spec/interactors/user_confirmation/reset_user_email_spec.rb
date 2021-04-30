require 'rails_helper'

RSpec.describe UserConfirmation::ResetUserEmail do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  before do
    AppConfiguration.instance.activate_feature!('user_confirmation')
  end

  context 'when passing a new email' do
    before do
      context[:user] = create(:user_with_confirmation)
      context[:new_email] = 'new@email.com'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'changes the user email' do
      expect { result }.to change(context[:user], :email).from(context[:user].email).to(context[:new_email])
    end
  end

  context 'when not passing a new email' do
    before do
      context[:user] = create(:user_with_confirmation)
    end

    it 'is a success' do
      expect(result).to be_a_success
    end

    it 'does not change the user email' do
      expect { result }.not_to change(context[:user], :email)
    end
  end

  context 'when passing an invalid new email' do
    before do
      context[:user] = create(:user_with_confirmation)
      context[:new_email] = 'new@email-com'
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'does not change the user email' do
      expect(context[:user].reload.email).not_to eq(context[:new_email])
    end

    it 'returns email errors' do
      expect(result.errors[:email]).not_to be_empty
    end
  end
end
