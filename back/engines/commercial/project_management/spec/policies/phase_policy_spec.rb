# frozen_string_literal: true

require 'rails_helper'

describe PhasePolicy do
  subject { described_class.new(user, phase) }

  let(:scope) { PhasePolicy::Scope.new(user, project.phases) }

  context 'on phase in a public project' do
    let(:project) { create(:project_with_phases, phases_count: 0) }
    let!(:phase) { create(:phase, project: project) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }

      it 'indexes the phase' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
