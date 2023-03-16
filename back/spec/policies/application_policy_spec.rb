# frozen_string_literal: true

require 'rails_helper'

describe ApplicationPolicy do
  include_context 'when user_blocking duration is 90 days' do
    context 'for blocked user' do
      let(:user) { create(:user, block_start_at: Time.now) }

      it 'does not consider user active' do
        expect(described_class.new(user, nil).send(:active?)).to be(false)
      end
    end
  end
end
