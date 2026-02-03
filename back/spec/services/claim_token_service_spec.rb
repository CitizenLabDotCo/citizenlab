# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClaimTokenService do
  describe '.generate' do
    context 'when item has no owner' do
      let(:idea) { create(:idea, author: nil) }

      it 'creates a claim token for the item' do
        token = nil
        expect { token = described_class.generate(idea) }
          .to change(ClaimToken, :count).by(1)

        expect(token.item).to eq(idea)
      end

      it 'returns existing token if already exists' do
        first_token = described_class.generate(idea)
        second_token = described_class.generate(idea)
        expect(first_token.id).to eq(second_token.id)
      end
    end

    context 'when item has an owner' do
      let(:idea) { create(:idea) }

      it 'does not create a claim token' do
        token = nil
        expect { token = described_class.generate(idea) }
          .not_to change(ClaimToken, :count)

        expect(token).to be_nil
      end
    end
  end

  describe '.mark' do
    let(:user) { create(:user) }
    let(:idea) { claim_token.item }
    let!(:claim_token) { create(:claim_token) }

    it 'sets pending_claimer_id on the token' do
      described_class.mark(user, [claim_token.token])
      expect(claim_token.reload.pending_claimer_id).to eq(user.id)
    end

    it 'does not update the item owner' do
      described_class.mark(user, [claim_token.token])
      expect(idea.reload.author_id).to be_nil
    end

    it 'marks and returns only valid tokens' do
      expired_token = create(:claim_token, :expired)
      tokens = [claim_token.token, expired_token.token, 'invalid-token']

      result = described_class.mark(user, tokens)

      expect(result).to contain_exactly(claim_token)
      expect(claim_token.reload.pending_claimer_id).to eq(user.id)
    end

    it 'overwrites pending_claimer if already set' do
      other_user = create(:user)
      claim_token.update!(pending_claimer_id: other_user.id)

      described_class.mark(user, [claim_token.token])

      expect(claim_token.reload.pending_claimer_id).to eq(user.id)
    end

    context 'with empty tokens' do
      it 'returns empty array' do
        result = described_class.mark(user, [])
        expect(result).to be_empty
      end

      it 'does not raise error with nil' do
        result = described_class.mark(user, nil)
        expect(result).to be_empty
      end
    end
  end

  describe '.complete' do
    let(:user) { create(:user) }
    let(:idea) { pending_token.item }
    let!(:pending_token) { create(:claim_token, pending_claimer: user) }

    it 'claims items for pending tokens belonging to the user' do
      items = described_class.complete(user)

      expect(items).to contain_exactly(idea)
      expect(idea.reload.author_id).to eq(user.id)
    end

    it 'deletes the pending claim tokens' do
      expect { described_class.complete(user) }
        .to change(ClaimToken, :count).by(-1)

      expect { pending_token.reload }
        .to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'logs claimed activity' do
      expect(LogActivityJob).to receive(:perform_later).with(idea, 'claimed', user, anything)
      described_class.complete(user)
    end

    it 'does not claim tokens belonging to other users' do
      other_user = create(:user)
      other_token = create(:claim_token, pending_claimer: other_user)

      described_class.complete(user)

      expect(other_token.reload.pending_claimer_id).to eq(other_user.id)
    end

    it 'claims expired tokens that are pending' do
      pending_token.update!(expires_at: 1.hour.ago)
      described_class.complete(user)
      expect(idea.reload.author_id).to eq(user.id)
    end

    it 'syncs user demographics by most recently created idea' do
      user = create(:user)
      idea1 = create(:idea, author: nil, created_at: 2.hours.ago, custom_field_values: {
        field: 'value',
        u_gender: 'male'
      })
      idea2 = create(:idea, author: nil, created_at: 1.hour.ago, custom_field_values: {
        field: 'value',
        u_gender: 'female'
      })
      create(:claim_token, item: idea1, pending_claimer: user)
      create(:claim_token, item: idea2, pending_claimer: user)

      described_class.complete(user)

      expect(user.reload.custom_field_values).to eq({
        'gender' => 'female'
      })
    end

    context 'idea in survey phase' do
      before do
        @project = create(:single_phase_native_survey_project, phase_attrs: { with_permissions: true })
        @phase = @project.phases.first
        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @idea = create(:idea, author: nil, custom_field_values: {
          field: 'value',
          u_gender: 'male'
        })
        @user = create(:user)
        @claim_token = create(:claim_token, item: @idea, pending_claimer: @user)
      end

      context 'when user_data_collection = all_data' do
        it 'syncs user demographics and sets author_id' do
          expect(@permission.user_data_collection).to eq('all_data')
          described_class.complete(@user)
          expect(@user.reload.custom_field_values).to eq({
            'gender' => 'male'
          })
          expect(@idea.reload.author_id).to eq(@user.id)
        end
      end

      context 'when user_data_collection = demographics_only' do
        before do
          @permission.update!(
            user_data_collection: 'demographics_only'
          )
        end

        it 'syncs user demographics but DOES NOT set author_id' do
          described_class.complete(@user)
          expect(@user.reload.custom_field_values).to eq({
            'gender' => 'male'
          })
          expect(@idea.reload.author_id).to eq(nil)
        end
      end
    end
  end

  describe '.claim' do
    let(:idea) { claim_token.item }
    let!(:claim_token) { create(:claim_token) }

    context 'when user does not require confirmation' do
      let(:user) { create(:user, email_confirmed_at: Time.current) }

      it 'claims items immediately' do
        result = described_class.claim(user, [claim_token.token])

        expect(result).to contain_exactly(idea)
        expect(idea.reload.author_id).to eq(user.id)
        expect(ClaimToken.find_by(id: claim_token.id)).to be_nil
      end

      it 'logs claimed activity' do
        expect(LogActivityJob).to receive(:perform_later).with(idea, 'claimed', user, anything)
        described_class.claim(user, [claim_token.token])
      end

      it 'ignores invalid tokens' do
        result = described_class.claim(user, ['invalid-token'])
        expect(result).to be_empty
      end

      it 'ignores expired tokens' do
        expired_token = create(:claim_token, :expired)
        result = described_class.claim(user, [expired_token.token])
        expect(result).to be_empty
      end
    end

    context 'when user requires confirmation' do
      let(:user) { create(:user_no_password) }

      before do
        SettingsService.new.activate_feature!('user_confirmation')
      end

      it 'marks tokens but does not claim immediately' do
        expect(user.confirmation_required?).to be true

        result = described_class.claim(user, [claim_token.token])

        expect(result).to be_nil
        expect(claim_token.reload.pending_claimer_id).to eq(user.id)
        expect(idea.reload.author_id).to be_nil
      end
    end

    context 'with blank tokens' do
      let(:user) { create(:user) }

      it 'returns empty array for empty tokens' do
        result = described_class.claim(user, [])
        expect(result).to be_empty
      end

      it 'returns empty array for nil tokens' do
        result = described_class.claim(user, nil)
        expect(result).to be_empty
      end
    end
  end

  describe '.cleanup_expired' do
    it 'deletes expired tokens' do
      expired = create_list(:claim_token, 2, :expired)
      valid = create(:claim_token)

      result = nil
      expect { result = described_class.cleanup_expired }
        .to change(ClaimToken, :count).by(-2)

      expect(result).to eq(2)
      expect(ClaimToken.where(id: expired)).to be_empty
      expect(ClaimToken.find_by(id: valid.id)).to be_present
    end
  end
end
