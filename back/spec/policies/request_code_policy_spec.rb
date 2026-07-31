# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RequestCodePolicy do
  subject { described_class.new(user, record) }

  describe '#request_code_email?' do
    # Case 1: email param + no authenticated user (the public flow). `record` is
    # the account owning the submitted email; there is no current_user.
    context 'without an authenticated user' do
      let(:user) { nil }

      it 'permits requesting a code for an existing account' do
        record = create(:user, email: 'test@test.com')
        expect(described_class.new(nil, record)).to permit(:request_code_email)
      end

      it 'permits requesting a code for a full account (password set + confirmed)' do
        record = create(:user, email: 'test@test.com')
        expect(record.password_digest).not_to be_nil
        expect(record.confirmation_required?).to be false
        expect(described_class.new(nil, record)).to permit(:request_code_email)
      end

      it 'does not permit when no account matches the email' do
        expect(described_class.new(nil, nil)).not_to permit(:request_code_email)
      end

      it 'does not permit once the code_reset_count limit is reached' do
        record = create(:unconfirmed_user)
        record.email_confirmation.update!(code_reset_count: 4)
        expect(described_class.new(nil, record)).not_to permit(:request_code_email)
      end

      it 'does not permit when password_login is disabled' do
        record = create(:user, email: 'test@test.com')
        allow(AppConfiguration.instance).to receive(:feature_activated?).with('password_login').and_return(false)
        expect(described_class.new(nil, record)).not_to permit(:request_code_email)
      end
    end

    # Cases 2 and 3: an authenticated user. The code may only be sent to that
    # same user, whether the email was omitted (record == current_user) or passed
    # explicitly and resolved to their own account.
    context 'with an authenticated user' do
      it 'permits requesting a code for their own account (record == user)' do
        user = create(:user, email: 'test@test.com')
        expect(described_class.new(user, user)).to permit(:request_code_email)
      end

      it 'does not permit requesting a code for a different account' do
        requester = create(:user, email: 'requester@test.com')
        other_user = create(:user, email: 'other@test.com')
        expect(described_class.new(requester, other_user)).not_to permit(:request_code_email)
      end

      it 'does not permit requesting a code for a different account even when that account is unconfirmed' do
        requester = create(:user, email: 'requester@test.com')
        other_user = create(:unconfirmed_user, email: 'other@test.com')
        expect(described_class.new(requester, other_user)).not_to permit(:request_code_email)
      end

      it 'does not permit once the code_reset_count limit is reached' do
        user = create(:unconfirmed_user)
        user.email_confirmation.update!(code_reset_count: 4)
        expect(described_class.new(user, user)).not_to permit(:request_code_email)
      end
    end
  end
end
