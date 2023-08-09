# frozen_string_literal: true

require 'rails_helper'

describe InitiativeStatusPolicy do
  describe InitiativeStatusPolicy::Scope do
    subject(:scope) { described_class.new(user, InitiativeStatus).resolve }

    def create_initiative_status_change(status, initiative: build(:initiative))
      create(:initiative_status_change, initiative: initiative, initiative_status: status)
    end

    context 'with default statuses' do
      let!(:status_review_pending) { create(:initiative_status_review_pending) }
      let!(:status_changes_requested) { create(:initiative_status_changes_requested) }
      let!(:status_proposed) { create(:initiative_status_proposed) }
      let!(:status_expired) { create(:initiative_status_expired) }
      let!(:status_threshold_reached) { create(:initiative_status_threshold_reached) }
      let!(:status_answered) { create(:initiative_status_answered) }
      let!(:status_ineligible) { create(:initiative_status_ineligible) }

      let!(:default_codes) { InitiativeStatus::CODES - ['custom'] }
      let!(:not_review_codes) { InitiativeStatus::NOT_REVIEW_CODES - ['custom'] }

      context 'when admin' do
        let(:user) { create(:admin) }

        context 'when review feature is not fully activated' do
          it 'does not return review statuses if no review initiative exists' do
            expect(scope.pluck(:code)).to match_array not_review_codes
          end

          it 'returns all statuses if at least one review_pending initiative exists' do
            create_initiative_status_change(status_review_pending)
            expect(scope.pluck(:code)).to match_array default_codes
          end

          it 'returns all statuses if at least one changes_requested initiative exists' do
            create_initiative_status_change(status_changes_requested)
            expect(scope.pluck(:code)).to match_array default_codes
          end
        end

        context 'when review feature is fully activated' do
          before do
            SettingsService.new.activate_feature! 'initiative_review'

            configuration = AppConfiguration.instance
            configuration.settings['initiatives']['require_review'] = true
            configuration.save!
          end

          it 'returns all initiative statuses' do
            expect(scope.pluck(:code)).to match_array default_codes
          end
        end
      end

      context 'when normal user' do
        let(:user) { create(:user) }

        it 'does not return review statuses if user authored no review initiatives' do
          create_initiative_status_change(status_review_pending)
          create_initiative_status_change(status_changes_requested)
          expect(scope.pluck(:code)).to match_array not_review_codes
        end

        it 'returns review_pending status if user authored an review_pending initiative' do
          create_initiative_status_change(status_review_pending, initiative: build(:initiative, author: user))
          expect(scope.pluck(:code)).to match_array not_review_codes + ['review_pending']
        end

        it 'returns changes_requested status if user authored an changes_requested initiative' do
          create_initiative_status_change(status_changes_requested, initiative: build(:initiative, author: user))
          expect(scope.pluck(:code)).to match_array not_review_codes + ['changes_requested']
        end
      end
    end
  end
end
