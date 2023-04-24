# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Invite do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:invite)).to be_valid
    end
  end

  describe 'Deleting an invite' do
    it 'deletes the invitee when the invite is pending' do
      invite = create(:invite)
      invitee = invite.invitee
      invite.destroy
      expect(User.find_by(id: invitee.id)).to be_nil
    end

    it 'retains the invitee when the invite is accepted' do
      invite = create(:accepted_invite)
      invitee = invite.invitee
      invite.destroy
      expect(User.find_by(id: invitee.id)).to be_present
    end
  end
end
