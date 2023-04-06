# frozen_string_literal: true

require 'rails_helper'

describe ApplicationPolicy do
  context 'for blocked user' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }

    it 'does not consider user active' do
      expect(described_class.new(user, nil).send(:active?)).to be(false)
    end
  end
end
