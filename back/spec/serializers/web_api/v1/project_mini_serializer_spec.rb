require 'rails_helper'

describe WebApi::V1::ProjectMiniSerializer do
  let!(:project) { create(:project) }
  let!(:user) { create(:user) }

  context 'starts_days_from_now' do
    let(:starts_days_from_now) do
      described_class
        .new(project, params: { current_user: user })
        .serializable_hash
        .dig(:data, :attributes, :starts_days_from_now)
    end

    it 'returns the number of days before first phase starts' do
      create(:phase, project: project, start_at: 27.hours.from_now)
      expect(starts_days_from_now).to eq(1)
    end

    it 'returns 0 if first phase starts today' do
      create(:phase, project: project, start_at: 2.hours.from_now)
      expect(starts_days_from_now).to be_zero
    end

    it 'returns nil if first phase started in the past' do
      create(:phase, project: project, start_at: 1.day.ago)
      expect(starts_days_from_now).to be_nil
    end

    it 'returns nil if there are no phases' do
      expect(starts_days_from_now).to be_nil
    end
  end

  context 'ended_days_ago' do
    let(:ended_days_ago) do
      described_class
        .new(project, params: { current_user: user })
        .serializable_hash
        .dig(:data, :attributes, :ended_days_ago)
    end

    it 'returns the number of days since the last phase ended' do
      create(:phase, project: project, end_at: 27.hours.ago)
      expect(ended_days_ago).to eq(1)
    end

    it 'returns 0 if last phase just ended' do
      create(:phase, project: project, end_at: 1.second.ago)
      expect(ended_days_ago).to be_zero
    end

    it 'returns nil if last phase ends in the future' do
      create(:phase, project: project, end_at: 2.days.from_now)
      expect(ended_days_ago).to be_nil
    end

    it 'returns nil if there are no phases' do
      expect(ended_days_ago).to be_nil
    end
  end
end
