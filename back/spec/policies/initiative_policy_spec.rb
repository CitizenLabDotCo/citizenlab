# frozen_string_literal: true

require 'rails_helper'

describe InitiativePolicy do
  subject(:policy) { described_class.new(user, initiative) }

  let(:scope) { InitiativePolicy::Scope.new(user, Initiative) }
  let(:author) { create(:user) }

  # We need to consider 4 main scenarios:
  # 1. When approval feature is NOT active, and
  # 2. When approval feature is active
  # a). When initiative has approval_pending or approval_rejected status
  # b). when initiative has status other than approval_pending or approval_rejected
  # 1a + 1b + 2a + 2b = 4 scenarios
  #
  # We avoid testing initiatives with 'custom' status, as it is not used and not adequately considered in the codebase.

  # ------------------- 1. Approval feature is NOT active ------------------

  context 'when approval feature is NOT fully active' do
    it 'is not active' do
      expect(Initiative.approval_required?).to be false
    end

    # For statuses with APPROVAL_CODES, we only show initiatives with approval statuses to the author and admins.
    context 'for initiatives with APPROVAL_CODES statuses' do
      InitiativeStatus::APPROVAL_CODES.each do |code|
        context "for an initiative with #{code} status" do
          let!(:initiative) do
            create(:initiative, author: author, initiative_status: create("initiative_status_#{code}".to_sym))
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
    end

    context 'for initiatives with NOT_APPROVAL_CODES statuses' do
      (InitiativeStatus::NOT_APPROVAL_CODES - ['custom']).each do |code|
        context "for an initiative with #{code} status" do
          let!(:initiative) do
            create(:initiative, author: author, initiative_status: create("initiative_status_#{code}".to_sym))
          end

          context 'for a user who is not author of the initiative' do
            let(:user) { create(:user) }

            it { is_expected.to permit(:show) }
            it { is_expected.to permit(:by_slug) }
            it { is_expected.not_to permit(:create) }
            it { is_expected.not_to permit(:update)  }
            it { is_expected.not_to permit(:destroy) }

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

            it 'indexes the initiative' do
              expect(scope.resolve.size).to eq 1
            end
          end
        end
      end
    end

    # For statuses with any CODES:
    context "for initiatives with any status code (except 'custom')" do
      (InitiativeStatus::CODES - ['custom']).each do |code|
        context "for an initiative with #{code} status" do
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

          # Author can edit/delete initiative if approval feature not active, regardless of status.
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
  end

  # ------------------- 2. Approval feature IS active ----------------------

  context 'when approval feature IS fully active' do
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

    # For statuses with APPROVAL_CODES, we only show initiatives with approval statuses to the author and admins.
    context 'for initiatives with APPROVAL_CODES statuses' do
      InitiativeStatus::APPROVAL_CODES.each do |code|
        context "for an initiative with #{code} status" do
          let!(:initiative) do
            create(:initiative, author: author, initiative_status: create("initiative_status_#{code}".to_sym))
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

          # Author can see initiative, but not edit, if approval feature is active.
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
    end

    context 'for initiatives with NOT_APPROVAL_CODES statuses' do
      (InitiativeStatus::NOT_APPROVAL_CODES - ['custom']).each do |code|
        context "for an initiative with #{code} status" do
          let!(:initiative) do
            create(:initiative, author: author, initiative_status: create("initiative_status_#{code}".to_sym))
          end

          context 'for a user who is not author of the initiative' do
            let(:user) { create(:user) }

            it { is_expected.to permit(:show) }
            it { is_expected.to permit(:by_slug) }
            it { is_expected.not_to permit(:create) }
            it { is_expected.not_to permit(:update)  }
            it { is_expected.not_to permit(:destroy) }

            it 'does not index the initiative' do
              expect(scope.resolve.size).to eq 1
            end
          end

          # Author can see initiative, but not edit, if approval feature is active.
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

          context 'for a visitor' do
            let(:user) { nil }

            it { is_expected.to permit(:show) }
            it { is_expected.to permit(:by_slug) }
            it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
            it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
            it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

            it 'does not index the initiative' do
              expect(scope.resolve.size).to eq 1
            end
          end
        end
      end
    end

    # For statuses with any CODES:
    context "for initiatives with any status code (except 'custom')" do
      (InitiativeStatus::CODES - ['custom']).each do |code|
        context "for an initiative with #{code} status" do
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
        end
      end
    end
  end
end
