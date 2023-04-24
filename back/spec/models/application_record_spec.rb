# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationRecord do
  subject(:user) { create(:user) }

  describe '#valid_attribute?' do
    it 'returns false for an invalid value' do
      user.email = 'bademail.email'
      expect(user.valid_attribute?(:email)).to be false
    end

    it 'returns true for a valid value' do
      expect(user.valid_attribute?(:email)).to be true
    end

    it 'doesnt change #errors' do
      user.email = 'bademail.email'
      expect { user.valid_attribute?(:email) }.not_to change(user, :errors)
    end

    it 'doesnt add errors to the user' do
      user.email = 'bademail.email'
      user.valid_attribute?(:email)
      expect(user.errors.empty?).to be true
    end
  end
end
