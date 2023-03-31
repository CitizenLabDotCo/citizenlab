# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ResetUserConfirmationCode do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  context 'when the user has made too many reset requests' do
    before do
      context[:user] = create(:user_with_confirmation)

      5.times do
        context[:user].increment_confirmation_code_reset_count!
      end
    end

    it 'returns a too many resets on code error' do
      expect(result.errors.details).to eq(code: [{ error: :too_many_resets }])
    end
  end
end
