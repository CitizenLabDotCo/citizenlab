# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::InviteSerializer do
  let(:invite) { create(:invite) }
  let(:attributes) do
    described_class.new(invite, params: { current_user: current_user }).serializable_hash.dig(:data, :attributes)
  end

  context 'for a viewer who may not see the token' do
    let(:current_user) { create(:admin) }

    it 'leaves out the token and the invite link' do
      expect(attributes).not_to include(:token, :activate_invite_url)
    end
  end

  context 'for a viewer who may see the token' do
    let(:current_user) { create(:super_admin) }

    it 'includes the token and the invite link' do
      expect(attributes).to include(token: invite.token, activate_invite_url: a_string_including(invite.token))
    end
  end
end
