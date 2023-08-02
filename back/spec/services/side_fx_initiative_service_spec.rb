# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe '#after_update' do
    context 'when initiative is rejected_on_review' do
      let(:initiative) do
        create(:initiative_status_review_pending)
        rejected_on_review = create(:initiative_status_rejected_on_review)
        create(:initiative, initiative_status: rejected_on_review, author: user)
      end

      it 'changes initiative status to review_pending' do
        service.after_update(initiative, user)
        expect(initiative.reload.initiative_status.code).to eq 'review_pending'
      end
    end
  end
end
