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
      create(:phase, project: project, start_at: 1.day.from_now.to_date)
      expect(starts_days_from_now).to eq(1)
    end

    it 'returns nil if first phase started today' do
      create(:phase, project: project, start_at: Time.zone.now.to_date)
      expect(starts_days_from_now).to be_nil
    end

    it 'returns nil if first phase started in the past' do
      create(:phase, project: project, start_at: 1.day.ago.to_date)
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
      create(:phase, project: project, end_at: 1.day.ago.to_date)
      expect(ended_days_ago).to eq(1)
    end

    it 'returns nil if last phase ends today' do
      create(:phase, project: project, end_at: Time.zone.now.to_date)
      expect(ended_days_ago).to be_nil
    end

    it 'returns nil if last phase ends in the future' do
      create(:phase, project: project, end_at: 1.day.from_now.to_date)
      expect(ended_days_ago).to be_nil
    end

    it 'returns nil if there are no phases' do
      expect(ended_days_ago).to be_nil
    end
  end

  context 'when action descriptors are not passed to serializer in params' do
    it 'finds and returns the action descriptors' do
      action_descriptors = described_class
        .new(project, params: { current_user: user })
        .serializable_hash
        .dig(:data, :attributes, :action_descriptors)

      expect(action_descriptors).to be_a(Hash).and(include(
        posting_idea: { enabled: false, disabled_reason: 'project_inactive', future_enabled_at: nil },
        commenting_idea: { enabled: false, disabled_reason: 'project_inactive' },
        reacting_idea: {
          enabled: false,
          disabled_reason: 'project_inactive',
          up: { enabled: false, disabled_reason: 'project_inactive' },
          down: { enabled: false, disabled_reason: 'project_inactive' }
        },
        comment_reacting_idea: { enabled: false, disabled_reason: 'project_inactive' },
        annotating_document: { enabled: false, disabled_reason: 'project_inactive' },
        taking_survey: { enabled: false, disabled_reason: 'project_inactive' },
        taking_poll: { enabled: false, disabled_reason: 'project_inactive' },
        voting: { enabled: false, disabled_reason: 'project_inactive' },
        attending_event: { enabled: true, disabled_reason: nil },
        volunteering: { enabled: false, disabled_reason: 'project_inactive' }
      ))
    end
  end

  context 'when action descriptors are passed to serializer in params' do
    it 'uses the provided action descriptors' do
      expected_action_descriptors = {
        posting_idea: { enabled: true, disabled_reason: nil, future_enabled_at: nil },
        commenting_idea: { enabled: true, disabled_reason: nil },
        reacting_idea: {
          enabled: true,
          disabled_reason: nil,
          up: { enabled: true, disabled_reason: nil },
          down: { enabled: true, disabled_reason: nil }
        },
        comment_reacting_idea: { enabled: true, disabled_reason: nil },
        annotating_document: { enabled: false, disabled_reason: 'not_document_annotation' },
        taking_survey: { enabled: false, disabled_reason: 'not_survey' },
        taking_poll: { enabled: false, disabled_reason: 'not_poll' },
        voting: { enabled: false, disabled_reason: 'not_voting' },
        attending_event: { enabled: true, disabled_reason: nil },
        volunteering: { enabled: false, disabled_reason: 'not_volunteering' }
      }

      action_descriptors = described_class
        .new(
          project,
          params: { current_user: user, project_descriptor_pairs: { project.id.to_s => expected_action_descriptors } }
        )
        .serializable_hash
        .dig(:data, :attributes, :action_descriptors)

      expect(action_descriptors).to eq(expected_action_descriptors)
    end
  end
end
