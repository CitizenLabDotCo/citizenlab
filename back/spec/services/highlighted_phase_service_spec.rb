# frozen_string_literal: true

require 'rails_helper'

describe HighlightedPhaseService do
  let(:service) { described_class.new(project) }

  let_it_be(:project, reload: true) { create(:project) }

  describe '#highlighted_phase and #participation_status' do
    context 'with a single active timeline phase' do
      let!(:phase) { create(:phase, project:, start_at: 1.week.ago, end_at: 1.week.from_now) }

      it 'highlights it as active' do
        expect(service.highlighted_phase).to eq phase
        expect(service.participation_status).to eq :active
      end
    end

    context 'when the timeline is over and a standalone phase is active' do
      let!(:timeline_phase) { create(:phase, project:, start_at: 2.months.ago, end_at: 1.month.ago) }
      let!(:standalone_phase) { create(:phase, :standalone, project:, start_at: 1.week.ago, end_at: 1.week.from_now) }

      it 'highlights the active standalone phase' do
        expect(service.highlighted_phase).to eq standalone_phase
        expect(service.participation_status).to eq :active
      end
    end

    context 'with an active timeline phase and an active standalone phase that ends sooner' do
      let!(:timeline_phase) { create(:phase, project:, start_at: 2.weeks.ago, end_at: 2.weeks.from_now) }
      let!(:standalone_phase) { create(:phase, :standalone, project:, start_at: 1.week.ago, end_at: 3.days.from_now) }

      it 'highlights the phase that ends soonest' do
        expect(service.highlighted_phase).to eq standalone_phase
      end
    end

    context 'with an active timeline phase that ends sooner than an active standalone phase' do
      let!(:timeline_phase) { create(:phase, project:, start_at: 2.weeks.ago, end_at: 1.week.from_now) }
      let!(:standalone_phase) { create(:phase, :standalone, project:, start_at: 1.week.ago, end_at: 2.weeks.from_now) }

      it 'highlights the phase that ends soonest' do
        expect(service.highlighted_phase).to eq timeline_phase
      end
    end

    context 'with an open-ended active phase and a dated active phase' do
      let!(:timeline_phase) { create(:phase, project:, start_at: 1.month.ago, end_at: nil) }
      let!(:standalone_phase) { create(:phase, :standalone, project:, start_at: 1.week.ago, end_at: 1.week.from_now) }

      it 'highlights the dated phase' do
        expect(service.highlighted_phase).to eq standalone_phase
      end
    end

    context 'with only open-ended active phases' do
      let!(:standalone_phase) { create(:phase, :standalone, project:, start_at: 2.weeks.ago, end_at: nil) }
      let!(:timeline_phase) { create(:phase, project:, start_at: 1.week.ago, end_at: nil) }

      it 'highlights the timeline phase first' do
        expect(service.highlighted_phase).to eq timeline_phase
        expect(service.participation_status).to eq :active
      end
    end

    context 'when the timeline is over and a standalone phase is scheduled' do
      let!(:timeline_phase) { create(:phase, project:, start_at: 2.months.ago, end_at: 1.month.ago) }
      let!(:standalone_phase) { create(:phase, :standalone, project:, start_at: 1.week.from_now, end_at: 2.weeks.from_now) }

      it 'highlights the upcoming standalone phase' do
        expect(service.highlighted_phase).to eq standalone_phase
        expect(service.participation_status).to eq :upcoming
      end
    end

    context 'when no phase has started yet' do
      let!(:later_phase) { create(:phase, project:, start_at: 1.month.from_now, end_at: 2.months.from_now) }
      let!(:sooner_phase) { create(:phase, project:, start_at: 1.week.from_now, end_at: 3.weeks.from_now) }

      it 'highlights the phase that starts soonest' do
        expect(service.highlighted_phase).to eq sooner_phase
        expect(service.participation_status).to eq :upcoming
      end
    end

    context 'when the timeline has a gap between a past and a future phase' do
      let!(:past_phase) { create(:phase, project:, start_at: 2.months.ago, end_at: 1.month.ago) }
      let!(:future_phase) { create(:phase, project:, start_at: 1.month.from_now, end_at: 2.months.from_now) }

      it 'highlights the upcoming phase' do
        expect(service.highlighted_phase).to eq future_phase
        expect(service.participation_status).to eq :upcoming
      end
    end

    context 'when all phases are in the past' do
      let!(:timeline_phase) { create(:phase, project:, start_at: 3.months.ago, end_at: 2.months.ago) }
      let!(:standalone_phase) { create(:phase, :standalone, project:, start_at: 6.weeks.ago, end_at: 2.weeks.ago) }

      it 'highlights the phase that ended last' do
        expect(service.highlighted_phase).to eq standalone_phase
        expect(service.participation_status).to eq :ended
      end
    end

    context 'when past phases tie on their end date' do
      let(:start_at) { 6.weeks.ago }
      let(:end_at) { 2.weeks.ago }
      let!(:newer_phase) { create(:phase, :standalone, project:, start_at:, end_at:, created_at: 1.day.ago) }
      let!(:older_phase) { create(:phase, :standalone, project:, start_at:, end_at:, created_at: 2.days.ago) }

      it 'resolves deterministically by creation date' do
        expect(service.highlighted_phase).to eq older_phase
      end
    end

    context 'when the project has no phases' do
      it 'returns no phase, no status and no day counts' do
        expect(service.highlighted_phase).to be_nil
        expect(service.participation_status).to be_nil
        expect(service.days_until_start).to be_nil
        expect(service.days_since_end).to be_nil
      end
    end
  end

  describe '#days_until_start' do
    it 'counts down to the highlighted phase when it is upcoming' do
      create(:phase, project:, start_at: 2.months.ago, end_at: 1.month.ago)
      create(:phase, :standalone, project:, start_at: 27.hours.from_now, end_at: 1.week.from_now)

      expect(service.days_until_start).to eq 1
    end
  end

  describe '#days_since_end' do
    it 'counts from the phase that ended last' do
      create(:phase, :standalone, project:, start_at: 2.months.ago, end_at: 10.days.ago)
      create(:phase, project:, start_at: 2.months.ago, end_at: 75.hours.ago)

      expect(service.days_since_end).to eq 3
    end
  end

  describe 'while a phase is active' do
    it 'returns nil for both day counts' do
      create(:phase, project:, start_at: 1.week.ago, end_at: 1.week.from_now)

      expect(service.days_until_start).to be_nil
      expect(service.days_since_end).to be_nil
    end
  end

  describe 'whole_days_between' do
    let(:now) { Time.now }

    it 'counts complete 24-hour spans' do
      expect(service.send(:whole_days_between, now, now + 27.hours)).to eq 1
      expect(service.send(:whole_days_between, now, now + 2.hours)).to eq 0
      expect(service.send(:whole_days_between, now, now + 24.hours)).to eq 1
      expect(service.send(:whole_days_between, now, now + 10.days + 3.hours)).to eq 10
    end
  end
end
