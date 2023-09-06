# frozen_string_literal: true

require 'rails_helper'

describe SideFxInitiativeStatusChangeService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:initiative) { create(:initiative, author: user) }

  describe '#after_create' do
    context "when status change is to 'proposed'" do
      let!(:initiative_status_change) do
        create(
          :initiative_status_change,
          initiative: initiative,
          initiative_status: create(:initiative_status_proposed)
        )
      end

      it 'logs a proposed activity job' do
        expect { service.after_create(initiative_status_change, user) }
          .to enqueue_job(LogActivityJob)
          .with(initiative_status_change.initiative, 'proposed', user, instance_of(Integer))
          .exactly(1).times
      end
    end

    context "when status change is to 'review_pending'" do
      let!(:initiative_status_change) do
        create(
          :initiative_status_change,
          initiative: initiative,
          initiative_status: create(:initiative_status_review_pending)
        )
      end

      it "doesn't log a proposed activity job" do
        expect { service.after_create(initiative_status_change, user) }
          .not_to enqueue_job(LogActivityJob)
          .with(instance_of(Initiative), 'proposed', anything, anything)
      end
    end
  end
end
