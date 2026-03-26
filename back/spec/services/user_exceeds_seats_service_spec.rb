# frozen_string_literal: true

# filepath: /Users/work/cl/citizenlab/back/spec/services/user_exceeds_seats_service_spec.rb

require 'rails_helper'

describe UserExceedsSeatsService do
  let(:config) { AppConfiguration.instance }
  let(:user) { create(:user) }

  before do
    config.settings['core'] ||= {}
    config.save!
  end

  context 'when user assigned moderator' do
    let(:params) { { 'seat_type' => 'moderator', 'user_id' => user.id } }

    context 'when user is already a moderator' do
      before { user.add_role('project_moderator') }

      it 'returns false (no extra seat needed)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when user is already an admin' do
      before { user.add_role('admin') }

      it 'returns false (no extra seat needed)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when the max is nil (no limit)' do
      before do
        config.settings['core']['maximum_moderators_number'] = nil
        config.save!
      end

      it 'returns false (unlimited moderators allowed)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when the max is defined but not being hit' do
      before do
        config.settings['core']['maximum_moderators_number'] = 5
        config.settings['core']['additional_moderators_number'] = 0
        config.save!

        # Create 3 moderators (below limit of 5)
        create_list(:project_moderator, 3)
      end

      it 'returns false (seats available)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when the max is defined and being hit' do
      before do
        config.settings['core']['maximum_moderators_number'] = 3
        config.settings['core']['additional_moderators_number'] = 0
        config.save!

        # Create 3 moderators (at limit of 3)
        create_list(:project_moderator, 3)
      end

      it 'returns true (exceeds seats)' do
        result = described_class.new(params).execute
        expect(result).to be true
      end

      context 'with additional seats' do
        before do
          config.settings['core']['additional_moderators_number'] = 2
          config.save!
        end

        it 'returns false (additional seats available)' do
          result = described_class.new(params).execute
          expect(result).to be false
        end
      end
    end

    context 'with user_email parameter' do
      context 'when user exists' do
        let(:params) { { 'seat_type' => 'moderator', 'user_email' => user.email } }

        before do
          config.settings['core']['maximum_moderators_number'] = 5
          config.save!
        end

        it 'works with email instead of user_id' do
          result = described_class.new(params).execute
          expect(result).to be false
        end

        context 'when user is already a moderator' do
          before { user.add_role('project_moderator') }

          it 'returns false (no extra seat needed)' do
            result = described_class.new(params).execute
            expect(result).to be false
          end
        end
      end

      context 'when user does not exist (new invite)' do
        let(:params) { { 'seat_type' => 'moderator', 'user_email' => 'newuser@example.com' } }

        context 'when seats are available' do
          before do
            config.settings['core']['maximum_moderators_number'] = 5
            config.settings['core']['additional_moderators_number'] = 0
            config.save!

            # Create 3 moderators (below limit of 5)
            create_list(:project_moderator, 3)
          end

          it 'returns false (counts as new seat, but available)' do
            result = described_class.new(params).execute
            expect(result).to be false
          end
        end

        context 'when seats are at limit' do
          before do
            config.settings['core']['maximum_moderators_number'] = 3
            config.settings['core']['additional_moderators_number'] = 0
            config.save!

            # Create 3 moderators (at limit of 3)
            create_list(:project_moderator, 3)
          end

          it 'returns true (new user would exceed seats)' do
            result = described_class.new(params).execute
            expect(result).to be true
          end
        end

        context 'when no limit is set' do
          before do
            config.settings['core']['maximum_moderators_number'] = nil
            config.save!
          end

          it 'returns false (unlimited moderators allowed)' do
            result = described_class.new(params).execute
            expect(result).to be false
          end
        end
      end
    end
  end

  context 'when user assigned admin' do
    let(:params) { { 'seat_type' => 'admin', 'user_id' => user.id } }

    context 'when user is already an admin' do
      before { user.add_role('admin') }

      it 'returns false (no extra seat needed)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when user is already a super admin' do
      before { user.add_role('super_admin') }

      it 'returns false (no extra seat needed)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when the max is nil (no limit)' do
      before do
        config.settings['core']['maximum_admins_number'] = nil
        config.save!
      end

      it 'returns false (unlimited admins allowed)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when the max is defined but not being hit' do
      before do
        config.settings['core']['maximum_admins_number'] = 5
        config.settings['core']['additional_admins_number'] = 0
        config.save!

        # Create 3 admins (below limit of 5)
        create_list(:admin, 3)
      end

      it 'returns false (seats available)' do
        result = described_class.new(params).execute
        expect(result).to be false
      end
    end

    context 'when the max is defined and being hit' do
      before do
        config.settings['core']['maximum_admins_number'] = 3
        config.settings['core']['additional_admins_number'] = 0
        config.save!

        # Create 3 admins (at limit of 3)
        create_list(:admin, 3)
      end

      it 'returns true (exceeds seats)' do
        result = described_class.new(params).execute
        expect(result).to be true
      end

      context 'with additional seats' do
        before do
          config.settings['core']['additional_admins_number'] = 2
          config.save!
        end

        it 'returns false (additional seats available)' do
          result = described_class.new(params).execute
          expect(result).to be false
        end
      end
    end

    context 'with user_email parameter' do
      context 'when user exists' do
        let(:params) { { 'seat_type' => 'admin', 'user_email' => user.email } }

        before do
          config.settings['core']['maximum_admins_number'] = 5
          config.save!
        end

        it 'works with email instead of user_id' do
          result = described_class.new(params).execute
          expect(result).to be false
        end

        context 'when user is already an admin' do
          before { user.add_role('admin') }

          it 'returns false (no extra seat needed)' do
            result = described_class.new(params).execute
            expect(result).to be false
          end
        end
      end

      context 'when user does not exist (new invite)' do
        let(:params) { { 'seat_type' => 'admin', 'user_email' => 'newadmin@example.com' } }

        context 'when seats are available' do
          before do
            config.settings['core']['maximum_admins_number'] = 5
            config.settings['core']['additional_admins_number'] = 0
            config.save!

            # Create 3 admins (below limit of 5)
            create_list(:admin, 3)
          end

          it 'returns false (counts as new seat, but available)' do
            result = described_class.new(params).execute
            expect(result).to be false
          end
        end

        context 'when seats are at limit' do
          before do
            config.settings['core']['maximum_admins_number'] = 3
            config.settings['core']['additional_admins_number'] = 0
            config.save!

            # Create 3 admins (at limit of 3)
            create_list(:admin, 3)
          end

          it 'returns true (new user would exceed seats)' do
            result = described_class.new(params).execute
            expect(result).to be true
          end
        end

        context 'when no limit is set' do
          before do
            config.settings['core']['maximum_admins_number'] = nil
            config.save!
          end

          it 'returns false (unlimited admins allowed)' do
            result = described_class.new(params).execute
            expect(result).to be false
          end
        end
      end
    end
  end

  context 'error handling' do
    it 'raises error when neither user_id nor user_email provided' do
      expect do
        described_class.new({ 'seat_type' => 'moderator' }).execute
      end.to raise_error(ActiveRecord::RecordNotFound, 'Must provide either user_id or user_email')
    end

    it 'raises error when user not found by id' do
      expect do
        described_class.new({ 'seat_type' => 'moderator', 'user_id' => 'invalid-id' }).execute
      end.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
