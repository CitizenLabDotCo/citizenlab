# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaExposureTransferService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:visitor_hash) { 'abc123hash456' }
  let(:project) { create(:project_with_active_ideation_phase) }
  let(:phase) { project.phases.first }
  let(:idea) { create(:idea, project: project, phases: [phase]) }

  describe '#transfer' do
    context 'with no anonymous exposures' do
      it 'returns 0' do
        count = service.transfer(visitor_hash: visitor_hash, user: user)
        expect(count).to eq(0)
      end
    end

    context 'with anonymous exposures' do
      let!(:anonymous_exposure) do
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea, phase: phase)
      end

      it 'transfers anonymous exposures to the user' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .to change { IdeaExposure.where(user: user).count }.by(1)
      end

      it 'clears the visitor_hash when transferring' do
        service.transfer(visitor_hash: visitor_hash, user: user)
        anonymous_exposure.reload
        expect(anonymous_exposure.visitor_hash).to be_nil
        expect(anonymous_exposure.user_id).to eq(user.id)
      end

      it 'returns the count of transferred exposures' do
        count = service.transfer(visitor_hash: visitor_hash, user: user)
        expect(count).to eq(1)
      end

      it 'removes anonymous exposures from the visitor_hash scope' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .to change { IdeaExposure.where(visitor_hash: visitor_hash).count }.by(-1)
      end
    end

    context 'with multiple anonymous exposures' do
      let(:idea2) { create(:idea, project: project, phases: [phase]) }
      let(:idea3) { create(:idea, project: project, phases: [phase]) }

      before do
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea, phase: phase)
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea2, phase: phase)
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea3, phase: phase)
      end

      it 'transfers all anonymous exposures to the user' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .to change { IdeaExposure.where(user: user).count }.by(3)
      end

      it 'returns the correct count' do
        count = service.transfer(visitor_hash: visitor_hash, user: user)
        expect(count).to eq(3)
      end
    end

    context 'with duplicate exposures' do
      before do
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea, phase: phase)
        create(:idea_exposure, user: user, idea: idea, phase: phase)
      end

      it 'does not create duplicate exposures' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .not_to change { IdeaExposure.where(user: user).count }
      end

      it 'deletes the anonymous duplicate' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .to change { IdeaExposure.where(visitor_hash: visitor_hash, user_id: nil).count }.by(-1)
      end

      it 'returns 0 since no new exposures were transferred' do
        count = service.transfer(visitor_hash: visitor_hash, user: user)
        expect(count).to eq(0)
      end
    end

    context 'with mixed duplicate and unique exposures' do
      let(:idea2) { create(:idea, project: project, phases: [phase]) }

      before do
        # Duplicate - user already has this one
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea, phase: phase)
        create(:idea_exposure, user: user, idea: idea, phase: phase)
        # Unique - user doesn't have this one
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea2, phase: phase)
      end

      it 'transfers only unique exposures' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .to change { IdeaExposure.where(user: user).count }.by(1)
      end

      it 'returns count of actually transferred (unique) exposures' do
        count = service.transfer(visitor_hash: visitor_hash, user: user)
        expect(count).to eq(1)
      end

      it 'deletes all anonymous exposures including duplicates' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .to change { IdeaExposure.where(visitor_hash: visitor_hash, user_id: nil).count }.by(-2)
      end
    end

    context 'with blank parameters' do
      it 'returns 0 when visitor_hash is blank' do
        count = service.transfer(visitor_hash: '', user: user)
        expect(count).to eq(0)
      end

      it 'returns 0 when visitor_hash is nil' do
        count = service.transfer(visitor_hash: nil, user: user)
        expect(count).to eq(0)
      end

      it 'returns 0 when user is nil' do
        count = service.transfer(visitor_hash: visitor_hash, user: nil)
        expect(count).to eq(0)
      end
    end

    context 'with exposures from different visitor hashes' do
      let(:other_visitor_hash) { 'other_hash_789' }

      before do
        create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, idea: idea, phase: phase)
        create(:idea_exposure, :anonymous, visitor_hash: other_visitor_hash, idea: idea, phase: phase)
      end

      it 'only transfers exposures matching the given visitor_hash' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .to change { IdeaExposure.where(user: user).count }.by(1)
      end

      it 'does not affect exposures with other visitor hashes' do
        expect { service.transfer(visitor_hash: visitor_hash, user: user) }
          .not_to change { IdeaExposure.where(visitor_hash: other_visitor_hash).count }
      end
    end
  end
end
