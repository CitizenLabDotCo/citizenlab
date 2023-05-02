# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactEvent do
  context 'when an event is created' do
    let!(:event) { create(:event) }

    it 'is also available as an event fact' do
      fact_event = described_class.find(event.id)
      expect(fact_event.dimension_project_id).to eq(event.project_id)
      expect(fact_event.dimension_date_created_id).to eq(event.created_at.to_date)
      expect(fact_event.dimension_date_start_id).to eq(event.start_at.to_date)
      expect(fact_event.dimension_date_end_id).to eq(event.end_at.to_date)
    end
  end
end
