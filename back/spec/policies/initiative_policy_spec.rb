# frozen_string_literal: true

require 'rails_helper'

describe InitiativePolicy do
  subject(:policy) { described_class.new(user, initiative) }

  let(:scope) { InitiativePolicy::Scope.new(user, Initiative) }

  context 'for an approval_pending initiative' do
    let(:author) { create(:user) }
    let!(:initiative) { create(:initiative, author: author, initiative_status: create(:initiative_status_approval_pending)) }

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:by_slug) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the initiative, regardless of status' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is not author of the initiative' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:by_slug) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the initiative' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a user who is author of the initiative' do
      let(:user) { author }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:by_slug) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the initiative, regardless of status' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
