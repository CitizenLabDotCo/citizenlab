# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserConfirmationService do
  subject(:service) { described_class.new }

  let(:user) { create(:user_with_confirmation) }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    RequestConfirmationCodeJob.perform_now user
  end

  context 'when the user is nil' do
    it 'returns a user blank error' do
      result = service.validate_and_confirm!(nil, '1234')

      expect(result.success?).to be false
      expect(result.errors.details).to eq({ user: [{ error: :blank }] })
    end
  end

  context 'when the code is nil' do
    it 'returns a code blank error' do
      result = service.validate_and_confirm!(user, nil)

      expect(result.success?).to be false
      expect(result.errors.details).to eq({ code: [{ error: :blank }] })
    end
  end

  context 'when the code is incorrect' do
    it 'returns a code invalid error' do
      result = service.validate_and_confirm!(user, 'failcode')

      expect(result.success?).to be false
      expect(result.errors.details).to eq(code: [{ error: :invalid }])
    end
  end

  context 'when the code has expired' do
    before do
      user.update(email_confirmation_code_sent_at: 1.week.ago)
    end

    it 'returns a code expired error' do
      result = service.validate_and_confirm!(user, user.email_confirmation_code)

      expect(result.success?).to be false
      expect(result.errors.details).to eq(code: [{ error: :expired }])
    end
  end

  context 'when the code has expired and is invalid' do
    before do
      user.update(email_confirmation_code_sent_at: 1.week.ago)
    end

    it 'returns a code invalid error' do
      result = service.validate_and_confirm!(user, 'failcode')

      expect(result.success?).to be false
      expect(result.errors.details).to eq(code: [{ error: :invalid }])
    end
  end
end
