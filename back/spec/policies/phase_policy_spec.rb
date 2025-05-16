# frozen_string_literal: true

require 'rails_helper'

describe PhasePolicy do
  subject { described_class.new(user, phase) }

  let(:scope) { PhasePolicy::Scope.new(user, project.phases) }

  context 'on a phase in a public project' do
    let(:project) { create(:project_with_phases, phases_count: 0) }
    let!(:phase) { create(:phase, project: project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.to     permit(:common_ground_results) }
      it { is_expected.to     permit(:submission_count) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:delete_inputs) }
      it { is_expected.not_to permit(:show_progress) }

      it 'should index the phase' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for residents' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.to     permit(:common_ground_results) }
      it { is_expected.to     permit(:submission_count) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:delete_inputs) }
      it { is_expected.to     permit(:show_progress) }

      it 'should index the phase' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to    permit(:show)    }
      it { is_expected.to    permit(:create)  }
      it { is_expected.to    permit(:update)  }
      it { is_expected.to    permit(:destroy) }
      it { is_expected.to    permit(:survey_results) }
      it { is_expected.to    permit(:common_ground_results) }
      it { is_expected.to    permit(:submission_count) }
      it { is_expected.to    permit(:index_xlsx) }
      it { is_expected.to    permit(:delete_inputs) }
      it { is_expected.to    permit(:show_progress) }

      it 'should index the phase' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:survey_results) }
      it { is_expected.to permit(:common_ground_results) }
      it { is_expected.to permit(:submission_count) }
      it { is_expected.to permit(:index_xlsx) }
      it { is_expected.to permit(:delete_inputs) }
      it { is_expected.to permit(:show_progress) }

      it 'indexes the phase' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'for a visitor on a phase in a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }
    let!(:phase) { create(:phase, project: project) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:survey_results) }
    it { is_expected.not_to permit(:common_ground_results) }
    it { is_expected.not_to permit(:submission_count) }
    it { is_expected.not_to permit(:index_xlsx) }
    it { is_expected.not_to permit(:delete_inputs) }
    it { is_expected.not_to permit(:show_progress) }

    it 'should not index the phase' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a phase in a private groups project where she's no member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }
    let!(:phase) { create(:phase, project: project) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:survey_results) }
    it { is_expected.not_to permit(:common_ground_results) }
    it { is_expected.not_to permit(:submission_count) }
    it { is_expected.not_to permit(:index_xlsx) }
    it { is_expected.not_to permit(:delete_inputs) }
    it { is_expected.not_to permit(:show_progress) }

    it 'should not index the phase' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a phase in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user) }
    let!(:phase) { project.phases.first }

    it { is_expected.to     permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:survey_results) }
    it { is_expected.to     permit(:common_ground_results) }
    it { is_expected.to     permit(:submission_count) }
    it { is_expected.not_to permit(:index_xlsx) }
    it { is_expected.not_to permit(:delete_inputs) }
    it { is_expected.to     permit(:show_progress) }

    it 'should index the phase' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
