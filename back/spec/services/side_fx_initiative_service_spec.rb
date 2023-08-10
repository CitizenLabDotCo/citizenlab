# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe '#after_update' do
    context 'when initiative is changes_requested' do
      let(:initiative) do
        create(:initiative_status_review_pending)
        changes_requested = create(:initiative_status_changes_requested)
        create(:initiative, initiative_status: changes_requested, author: user)
      end

      it 'changes initiative status to review_pending' do
        service.after_update(initiative, user)
        expect(initiative.reload.initiative_status.code).to eq 'review_pending'
      end
    end
  end
end
