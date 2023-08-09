# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe '#after_update' do
    context 'when initiative is requires_changes' do
      let(:initiative) do
        create(:initiative_status_review_pending)
        requires_changes = create(:initiative_status_requires_changes)
        create(:initiative, initiative_status: requires_changes, author: user)
      end

      it 'changes initiative status to review_pending' do
        service.after_update(initiative, user)
        expect(initiative.reload.initiative_status.code).to eq 'review_pending'
      end
    end
  end
end
