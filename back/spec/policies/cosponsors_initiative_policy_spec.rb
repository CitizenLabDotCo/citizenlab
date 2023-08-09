# frozen_string_literal: true

require 'rails_helper'

describe CosponsorsInitiativePolicy do
  subject(:policy) { described_class.new(user, cosponsors_initiative) }

  let(:scope) { CosponsorsInitiativePolicy::Scope.new(user, CosponsorsInitiative) }
  let(:cosponsor) { create(:user) }
  let(:initiative) { create(:initiative) }
  let(:cosponsors_initiative) { create(:cosponsors_initiative, user: cosponsor, initiative: initiative) }

  context 'for the cosponsor' do
    let(:user) { cosponsor }

    it { is_expected.to permit(:accept_invite) }
  end

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:accept_invite) }
  end

  context 'for a signed-in user who is not the cosponsor' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:accept_invite) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.not_to permit(:accept_invite) }
  end
end
