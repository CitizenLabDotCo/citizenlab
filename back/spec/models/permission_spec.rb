# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:permission)).to be_valid
    end
  end

  describe 'global_custom_fields' do
    context 'everyone_confirmed_email' do
      it 'is false when created' do
        permission = create(:permission, :by_everyone_confirmed_email)
        expect(permission.global_custom_fields).to be_falsey
      end

      it 'is false when updated to everyone_confirmed_email' do
        permission = create(:permission, global_custom_fields: true)
        permission.update!(permitted_by: 'everyone_confirmed_email')
        expect(permission.global_custom_fields).to be_falsey
      end

      it 'is false even when set to true' do
        permission = create(:permission, :by_everyone_confirmed_email)
        permission.update!(global_custom_fields: true)
        expect(permission.global_custom_fields).to be_falsey
      end
    end

    context 'user' do
      it 'is true when created' do
        permission = create(:permission, :by_users, global_custom_fields: nil)
        expect(permission.global_custom_fields).to be_truthy
      end
    end
  end
end
