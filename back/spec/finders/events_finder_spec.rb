# frozen_string_literal: true

require 'rails_helper'

describe EventsFinder do
  subject(:finder) { described_class.new(params, **options) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { finder.find_records.pluck(:id) }

  before do
    create_list(:event, 5)
  end

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
end
