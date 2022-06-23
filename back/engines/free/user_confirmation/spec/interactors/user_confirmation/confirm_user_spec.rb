# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmation::ConfirmUser do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }
  let(:user) { create(:user_with_confirmation) }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    UserConfirmation::SendConfirmationCode.call(user: user)
  end

  context 'when the user is nil' do
    before do
      context[:code] = '1234'
    end

    it 'returns a code blank error' do
      expect(result.errors.details).to eq({ user: [{ error: :blank }] })
    end
  end

  context 'when the code is nil' do
    before do
      context[:user] = user
    end

    it 'returns a code blank error' do
      expect(result.errors.details).to eq({ code: [{ error: :blank }] })
    end
  end

  context 'when the code is incorrect' do
    before do
      context[:user] = user
      context[:code] = 'failcode'
    end

    it 'returns a code invalid error' do
      expect(result.errors.details).to eq(code: [{ error: :invalid }])
    end
  end

  context 'when the code has expired' do
    before do
      user.update(email_confirmation_code_sent_at: 1.week.ago)

      context[:user] = user
      context[:code] = user.email_confirmation_code
    end

    it 'returns a code invalid error' do
      expect(result.errors.details).to eq(code: [{ error: :expired }])
    end
  end

  context 'when the code has expired and is invalid' do
    before do
      user.update(email_confirmation_code_sent_at: 1.week.ago)
      context[:user] = user
      context[:code] = 'failcode'
    end

    it 'returns a code invalid error' do
      expect(result.errors.details).to eq(code: [{ error: :expired }])
    end
  end
end
