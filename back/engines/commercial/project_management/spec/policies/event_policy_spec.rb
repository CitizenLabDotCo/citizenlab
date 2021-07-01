# frozen_string_literal: true

require 'rails_helper'

describe EventPolicy do
  subject { described_class.new(user, event) }

  let(:scope) { EventPolicy::Scope.new(user, project.events) }

  context 'on event in a public project' do
    let(:project) { create(:continuous_project) }
    let!(:event) { create(:event, project: project) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }

      it 'indexes the event' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
