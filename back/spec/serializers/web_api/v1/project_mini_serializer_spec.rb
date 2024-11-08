require 'rails_helper'

describe WebApi::V1::ProjectMiniSerializer do
  context 'when action descriptors are not passed to serializer in params' do
    let(:project) { create(:project) }
    let(:user) { create(:user) }

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
end
