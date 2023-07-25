# frozen_string_literal: true

require 'rails_helper'

describe InitiativePolicy do
  subject(:policy) { described_class.new(user, initiative) }

  let(:scope) { InitiativePolicy::Scope.new(user, Initiative) }

  # For statuses with APPROVAL_CODES:
  # We only show initiatives with approval statuses to the author and admins
  InitiativeStatus::APPROVAL_CODES.each do |code|
    context "for an initiative with #{code} status" do
      let(:author) { create(:user) }
      let!(:initiative) do
        create(:initiative, author: author, initiative_status: create("initiative_status_#{code}".to_sym))
      end

      context 'for an admin' do
        let(:user) { create(:admin) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:by_slug) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:update)  }
        it { is_expected.to permit(:destroy) }

        it 'indexes the initiative' do
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
        it { is_expected.to permit(:update)  } # <- tie this to the specific status
        it { is_expected.to permit(:destroy) }

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

        it 'does not index the initiative' do
          expect(scope.resolve.size).to eq 0
        end
      end
    end
  end

  # What's the difference(s)?
  # We only show initiatives with approval statuses to the author and admins
  # Only authors && admins can edit/delete/create - always the case
  # When feature on, no editing/deleting/creating by author beyond approval

  # feature on / off for statuses beyond approval
  # maybe iterate over all such statuses and test them

  # For statuses with NOT_APPROVAL_CODES:

  # When approval feature is NOT active,
  # authors && admins can edit/delete/create an initiative with any status
  context 'when approval feature is not fully active' do
    it 'is not active' do
      expect(Initiative.approval_required?).to be false
    end

    (InitiativeStatus::NOT_APPROVAL_CODES - ['custom']).each do |code|
      context "for an initiative with #{code} status" do
        let(:author) { create(:user) }
        let!(:initiative) do
          create(:initiative, author: author, initiative_status: create("initiative_status_#{code}".to_sym))
        end

        context 'for a user who is author of the initiative' do
          let(:user) { author }

          it { is_expected.to permit(:show) }
          it { is_expected.to permit(:by_slug) }
          it { is_expected.to permit(:create) }
          it { is_expected.to permit(:update)  }
          it { is_expected.to permit(:destroy) }

          it 'indexes the initiative' do
            expect(scope.resolve.size).to eq 1
          end
        end
      end
    end
  end

  # When approval feature IS active,
  # authors cannot edit/delete/create an initiative with any status
  context 'when approval feature is fully active' do
    before do
      SettingsService.new.activate_feature! 'initiative_approval'

      configuration = AppConfiguration.instance
      configuration.settings['initiatives'] = {
        enabled: true,
        allowed: true,
        require_approval: true, # This is also required to activate the feature
        reacting_threshold: 2,
        days_limit: 20,
        threshold_reached_message: { 'en' => 'Threshold reached' },
        eligibility_criteria: { 'en' => 'Eligibility criteria' }
      }
      configuration.save!
    end

    it 'is active' do
      expect(Initiative.approval_required?).to be true
    end

    (InitiativeStatus::NOT_APPROVAL_CODES - ['custom']).each do |code|
      context "for an initiative with #{code} status" do
        let(:author) { create(:user) }
        let!(:initiative) do
          create(:initiative, author: author, initiative_status: create("initiative_status_#{code}".to_sym))
        end

        context 'for a user who is author of the initiative' do
          let(:user) { author }

          it { is_expected.to permit(:show) }
          it { is_expected.to permit(:by_slug) }
          it { is_expected.not_to permit(:create) }
          it { is_expected.not_to permit(:update)  }
          it { is_expected.not_to permit(:destroy) }

          it 'indexes the initiative' do
            expect(scope.resolve.size).to eq 1
          end
        end
      end
    end
  end
end
