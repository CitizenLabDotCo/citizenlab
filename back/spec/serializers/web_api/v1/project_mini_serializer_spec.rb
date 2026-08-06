require 'rails_helper'

describe WebApi::V1::ProjectMiniSerializer do
  let_it_be(:project, reload: true) { create(:project) }
  let_it_be(:user, reload: true) { create(:user) }

  let(:serialized) do
    described_class.new(project, params: { current_user: user }).serializable_hash
  end

  it 'serializes the highlighted phase and its day counts' do
    create(:phase, project: project, start_at: 2.months.ago, end_at: 1.month.ago)
    standalone_phase = create(:phase, :standalone, project: project, start_at: 27.hours.from_now, end_at: 1.week.from_now)

    expect(serialized.dig(:data, :relationships, :highlighted_phase, :data, :id)).to eq standalone_phase.id
    expect(serialized.dig(:data, :attributes, :participation_status)).to eq :upcoming
    expect(serialized.dig(:data, :attributes, :days_until_start)).to eq 1
    expect(serialized.dig(:data, :attributes, :days_since_end)).to be_nil
  end

  it 'serializes the highlighted phase when all phases are past' do
    phase = create(:phase, project: project, start_at: 2.months.ago, end_at: 75.hours.ago)

    expect(serialized.dig(:data, :relationships, :highlighted_phase, :data, :id)).to eq phase.id
    expect(serialized.dig(:data, :attributes, :participation_status)).to eq :ended
    expect(serialized.dig(:data, :attributes, :days_since_end)).to eq 3
  end
end
