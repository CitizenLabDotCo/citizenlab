require 'rails_helper'

RSpec.describe UserConfirmation::ResetUserConfirmationCode do
  subject(:result) { described_class.call(context) }

  let(:context) { {} }

  before do
    AppConfiguration.instance.activate_feature!('user_confirmation')
  end

  context 'when the confirmation code generation mechanism is broken' do
    before do
      context[:user] = create(:user_with_confirmation)
      allow(UserConfirmation::CodeGenerator).to receive(:call).and_return(OpenStruct.new(code: 'asdasdasd'))
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a code invalid error' do
      expect(result.errors.details).to include(code: [{ error: :invalid }])
    end
  end

  context 'when the user has made too many reset requests' do
    before do
      context[:user] = create(:user_with_confirmation)

      5.times do
        context[:user].reset_confirmation_code!
      end
    end

    it 'is a failure' do
      expect(result).to be_a_failure
    end

    it 'returns a too many resets on code error' do
      expect(result.errors.details).to include(code: [{ error: :too_many_resets }])
    end
  end
end
