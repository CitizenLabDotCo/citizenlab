# frozen_string_literal: true

require 'rails_helper'

describe InitiativeStatusPolicy do
  describe InitiativeStatusPolicy::Scope do
    subject(:scope) { described_class.new(user, InitiativeStatus).resolve }

    context 'with default statuses' do
      let!(:status_approval_pending) { create(:initiative_status_approval_pending) }
      let!(:status_approval_rejected) { create(:initiative_status_approval_rejected) }
      let!(:status_proposed) { create(:initiative_status_proposed) }
      let!(:status_expired) { create(:initiative_status_expired) }
      let!(:status_threshold_reached) { create(:initiative_status_threshold_reached) }
      let!(:status_answered) { create(:initiative_status_answered) }
      let!(:status_ineligible) { create(:initiative_status_ineligible) }

      let!(:default_codes) { InitiativeStatus::CODES - ['custom'] }
      let!(:not_approval_codes) { InitiativeStatus::NOT_APPROVAL_CODES - ['custom'] }

      context 'when admin' do
        let(:user) { create(:admin) }

        context 'when approval feature is not fully activated' do
          it 'does not return approval statuses if no approval initiative exists' do
            expect(scope.pluck(:code)).to match_array not_approval_codes
          end

          it 'returns all statuses if at least one approval_pending initiative exists' do
            create(
              :initiative_status_change,
              initiative: build(:initiative), initiative_status: status_approval_pending
            )
            expect(scope.pluck(:code)).to match_array default_codes
          end

          it 'returns all statuses if at least one approval_rejected initiative exists' do
            create(
              :initiative_status_change,
              initiative: build(:initiative), initiative_status: status_approval_rejected
            )
            expect(scope.pluck(:code)).to match_array default_codes
          end
        end

        context 'when approval feature is fully activated' do
          before do
            SettingsService.new.activate_feature! 'initiative_approval'

            configuration = AppConfiguration.instance
            configuration.settings['initiatives']['require_approval'] = true
            configuration.save!
          end

          it 'returns all initiative statuses' do
            expect(scope.pluck(:code)).to match_array default_codes
          end
        end
      end

      context 'when normal user' do
        let(:user) { create(:user) }

        it 'does not return approval statuses if user authored no approval initiatives' do
          create(
            :initiative_status_change,
            initiative: build(:initiative, author: build(:user)), initiative_status: status_approval_pending
          )
          create(
            :initiative_status_change,
            initiative: build(:initiative, author: build(:user)), initiative_status: status_approval_rejected
          )
          expect(scope.pluck(:code)).to match_array not_approval_codes
        end

        it 'returns approval_pending status if user authored an approval_pending initiative' do
          create(
            :initiative_status_change,
            initiative: build(:initiative, author: user), initiative_status: status_approval_pending
          )
          expect(scope.pluck(:code)).to match_array not_approval_codes + ['approval_pending']
        end

        it 'returns approval_rejected status if user authored an approval_rejected initiative' do
          create(
            :initiative_status_change,
            initiative: build(:initiative, author: user), initiative_status: status_approval_rejected
          )
          expect(scope.pluck(:code)).to match_array not_approval_codes + ['approval_rejected']
        end
      end
    end
  end
end
