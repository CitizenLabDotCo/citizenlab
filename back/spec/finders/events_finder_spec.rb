# frozen_string_literal: true

require 'rails_helper'

describe EventsFinder do
  subject(:finder) { described_class.new(params, **options) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { finder.find_records.pluck(:id) }

  let_it_be(:initial_events) { create_list(:event, 5) }

  context 'when no params or options are received' do
    it 'returns all' do
      expect(finder.find_records.count).to eq Event.count
    end
  end

  describe '#project_ids_condition' do
    let(:project) { create(:project) }
    let(:expected_record_ids) { Event.where(project: project).pluck(:id) }

    before do
      create_list(:event, 5)
      create_list(:event, 2, project: project).pluck(:id)
      params[:project_ids] = [project.id]
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#project_publication_statuses_condition' do
    let(:project) { create(:project) }
    let(:project2) { create(:project, { admin_publication_attributes: { publication_status: 'draft' } }) }
    let(:expected_record_ids) { Event.where(project: project2).pluck(:id) }

    before do
      create_list(:event, 3, project: project)
      create_list(:event, 3, project: project2).pluck(:id)
      params[:project_publication_statuses] = ['draft']
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#ends_before_date_condition' do
    let(:expected_record_ids) { Event.where('end_at < ?', Time.zone.today).pluck(:id) }

    before do
      create_list(:event, 5, start_at: Time.zone.today - 1.week, end_at: Time.zone.today - 1.week + 1.day)
      create_list(:event, 5, start_at: Time.zone.today + 1.week, end_at: Time.zone.today + 1.week + 1.day)
      params[:ends_before_date] = Time.zone.now
    end

    it 'returns the past events' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#ends_on_or_after_date_condition' do
    let(:expected_record_ids) { Event.where('end_at >= ?', Time.zone.today).pluck(:id) }

    before do
      create_list(:event, 5, start_at: Time.zone.today - 1.week, end_at: Time.zone.today - 1.week + 1.day)
      create_list(:event, 5, start_at: Time.zone.today + 1.week, end_at: Time.zone.today + 1.week + 1.day)
      params[:ends_on_or_after_date] = Time.zone.now
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#attendee_id_condition' do
    let(:attendee) { create(:user) }
    let(:params) { { attendee_id: attendee.id } }
    let!(:expected_record_ids) do
      initial_events.take(2).map do |event|
        event.attendees << attendee
        event.id
      end
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#ongoing_during_condition' do
    let_it_be(:event1) do
      create(
        :event,
        start_at: Time.zone.parse('2023-01-01T00:00:00Z'),
        end_at: Time.zone.parse('2023-01-02T00:00:00Z')
      )
    end

    let_it_be(:event2) do
      create(
        :event,
        start_at: Time.zone.parse('2023-01-01T00:00:00Z'),
        end_at: Time.zone.parse('2023-01-03T00:00:00Z')
      )
    end

    let_it_be(:event3) do
      create(
        :event,
        start_at: Time.zone.parse('2023-01-10T12:00:00Z'),
        end_at: Time.zone.parse('2023-01-10T14:00:00Z')
      )
    end

    let_it_be(:events) { Event.where(id: [event1.id, event2.id, event3.id]) }

    where(:start_at, :end_at, :expected_events) do
      [
        ['2022-12-31T12:00:00Z', '2023-01-01T00:00:00Z', []],
        ['2022-12-31T12:00:00Z', '2023-01-01T01:00:00Z', [ref(:event1), ref(:event2)]],
        ['2023-01-01T12:00:00Z', '2023-01-01T14:00:00Z', [ref(:event1), ref(:event2)]],
        ['2023-01-01T12:00:00Z', '2023-01-04T00:00:00Z', [ref(:event1), ref(:event2)]],
        ['2023-01-02T00:00:00Z', '2023-01-03T00:00:00Z', [ref(:event2)]],

        ['2023-01-10T00:00:00Z', '2023-01-10T12:00:00Z', []],
        ['2023-01-10T00:00:00Z', '2023-01-10T11:00:00-01:00', []],
        ['2023-01-10T00:00:00Z', '2023-01-10T12:00:01Z', [ref(:event3)]],
        ['2023-01-10T00:00:00Z', '2023-01-10T11:00:01-01:00', [ref(:event3)]],

        ['2023-01-10T14:00:00Z', '2023-01-10T23:59:59Z', []],
        ['2023-01-10T15:00:00+01:00', '2023-01-10T23:59:59Z', []],
        ['2023-01-10T13:59:59Z', '2023-01-10T23:59:59Z', [ref(:event3)]],
        ['2023-01-10T14:59:59+01:00', '2023-01-10T23:59:59Z', [ref(:event3)]]
      ]
    end

    with_them do
      let(:finder) do
        start_dt = Time.zone.parse(start_at)
        end_dt = Time.zone.parse(end_at)

        described_class.new(
          { ongoing_during: [start_dt, end_dt] },
          scope: events
        )
      end

      it 'returns the correct records' do
        expect(result_record_ids).to match_array expected_events.map(&:id)
      end
    end
  end
end
