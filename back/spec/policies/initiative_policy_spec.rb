# frozen_string_literal: true

require 'rails_helper'

describe InitiativePolicy do
  subject(:policy) { described_class.new(user, initiative) }

  let(:scope) { InitiativePolicy::Scope.new(user, Initiative) }
  let(:author) { create(:user) }

  # We need to consider 4 main scenarios:
  # 1. When review feature is NOT active, and
  # 2. When review feature is active
  # a). When initiative has review_pending or review_rejected status
  # b). when initiative has status other than review_pending or review_rejected
  # 1a + 1b + 2a + 2b = 4 scenarios
  #
  # We avoid testing initiatives with 'custom' status, as it is not used and not adequately considered in the codebase.

  # ------------------- 1. Review feature is NOT active -------------------

  context 'when review feature is NOT fully active' do
    it 'is not active' do
      expect(Initiative.review_required?).to be false
    end

    # For statuses with REVIEW_CODES, we only show/index initiatives with review statuses to the author and admins.
    context 'for an initiative with status review_pending' do
      let!(:initiative) do
        create(:initiative, author: author, initiative_status: create(:initiative_status_review_pending))
      end

      context 'for an admin' do
        let(:user) { create(:admin) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update)  }
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is not author of the initiative' do
        let(:user) { create(:user) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'does not index the initiative' do
          expect(scope.resolve.size).to eq 0
        end
      end

      context 'for a user who is author of the initiative' do
        let(:user) { author }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is cosponsor of the initiative' do
        let(:user) { create(:user) }
        let!(:cosponsors_initiative) { create(:cosponsors_initiative, user: user, initiative: initiative) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a visitor' do
        let(:user) { nil }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:by_slug) }
        it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'does not index the initiative' do
          expect(scope.resolve.size).to eq 0
        end
      end
    end

    context 'for an initiative with proposed status' do
      let!(:initiative) do
        create(:initiative, author: author, initiative_status: create(:initiative_status_proposed))
      end

      context 'for an admin' do
        let(:user) { create(:admin) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is not author of the initiative' do
        let(:user) { create(:user) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is author of the initiative' do
        let(:user) { author }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is cosponsor of the initiative' do
        let(:user) { create(:user) }
        let!(:cosponsors_initiative) { create(:cosponsors_initiative, user: user, initiative: initiative) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a visitor' do
        let(:user) { nil }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end
    end
  end

  # ------------------- 2. Review feature IS active ----------------------

  context 'when review feature IS fully active' do
    before do
      SettingsService.new.activate_feature! 'initiative_review'

      configuration = AppConfiguration.instance
      configuration.settings['initiatives']['require_review'] = true
      configuration.save!
    end

    it 'is active' do
      expect(Initiative.review_required?).to be true
    end

    # For statuses with REVIEW_CODES, we only show initiatives with review statuses to the author and admins.
    context 'for an initiative with review_pending status' do
      let!(:initiative) do
        create(:initiative, author: author, initiative_status: create(:initiative_status_review_pending))
      end

      context 'for an admin' do
        let(:user) { create(:admin) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is not author of the initiative' do
        let(:user) { create(:user) }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'does not index the initiative' do
          expect(scope.resolve.size).to eq 0
        end
      end

      # Author can still see their own initiative if review feature is active,
      # even when status in InitiativeStatus::REVIEW_CODES.
      context 'for a user who is author of the initiative' do
        let(:user) { author }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      # Cosponsor can still see an initiative thaye are a cosponsor of if review feature is active,
      # even when status in InitiativeStatus::REVIEW_CODES.
      context 'for a user who is cosponsor of the initiative' do
        let(:user) { create(:user) }
        let!(:cosponsors_initiative) { create(:cosponsors_initiative, user: user, initiative: initiative) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a visitor' do
        let(:user) { nil }

        it { is_expected.not_to permit(:show) }
        it { is_expected.not_to permit(:by_slug) }
        it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'does not index the initiative' do
          expect(scope.resolve.size).to eq 0
        end
      end
    end

    context 'for an initiative with proposed status' do
      let!(:initiative) do
        create(:initiative, author: author, initiative_status: create(:initiative_status_proposed))
      end

      context 'for an admin' do
        let(:user) { create(:admin) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is not author of the initiative' do
        let(:user) { create(:user) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'does not index the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      # Author can see initiative, but not edit, if review feature is active,
      # and when status in InitiativeStatus::NOT_REVIEW_CODES
      context 'for a user who is author of the initiative' do
        let(:user) { author }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update) } # TODO: This is confusing, as editing_locked should be true when status proposed!
        it { is_expected.to permit(:destroy) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a user who is cosponsor of the initiative' do
        let(:user) { create(:user) }
        let!(:cosponsors_initiative) { create(:cosponsors_initiative, user: user, initiative: initiative) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:destroy) }
        it { is_expected.to permit(:accept_cosponsorship_invite) }

        it 'indexes the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for a visitor' do
        let(:user) { nil }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
        it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }
        it { is_expected.not_to permit(:accept_cosponsorship_invite) }

        it 'does not index the initiative' do
          expect(scope.resolve.size).to eq 1
        end
      end
    end
  end

  # Nobody can edit initiative if editing is locked, including admins and authors
  context 'when editing is locked for the initiative' do
    let!(:initiative) do
      create(:initiative, author: author, editing_locked: true, initiative_status: create(:initiative_status_proposed))
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:by_slug) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.not_to permit(:accept_cosponsorship_invite) }

      it 'indexes the initiative' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is author of the initiative' do
      let(:user) { author }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:by_slug) }
      it { is_expected.to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.not_to permit(:accept_cosponsorship_invite) }

      it 'indexes the initiative' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
