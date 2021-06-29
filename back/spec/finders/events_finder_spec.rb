# frozen_string_literal: true

require 'rails_helper'

describe EventsFinder do
  subject(:result) { described_class.find(params, **options) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { result.records.pluck(:id) }
  let(:past_events) {  }
  let(:future_events) {  }

  before do
    create_list(:event, 5)
  end

  context 'when no params or options are received' do
    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns all' do
      expect(result.count).to eq Event.count
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

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#start_at_lt_condition' do
    let(:expected_record_ids) { Event.where('start_at < ?', Time.zone.today).pluck(:id) }

    before do
      create_list(:event, 5, start_at: Time.zone.today - 1.week, end_at: Time.zone.today - 1.week + 1.day)
      create_list(:event, 5, start_at: Time.zone.today + 1.week, end_at: Time.zone.today + 1.week + 1.day)
      params[:start_at_lt] = Time.zone.now
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the past events' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#start_at_gteq_condition' do
    let(:expected_record_ids) { Event.where('start_at >= ?', Time.zone.today).pluck(:id) }

    before do
      create_list(:event, 5, start_at: Time.zone.today - 1.week, end_at: Time.zone.today - 1.week + 1.day)
      create_list(:event, 5, start_at: Time.zone.today + 1.week, end_at: Time.zone.today + 1.week + 1.day)
      params[:start_at_gteq] = Time.zone.now
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end
end
