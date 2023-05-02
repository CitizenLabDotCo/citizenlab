# frozen_string_literal: true

require 'rails_helper'

describe ProjectPolicy do
  subject { described_class.new(user, project) }

  let(:scope) { ProjectPolicy::Scope.new(user, Project) }
  let(:inverse_scope) { ProjectPolicy::InverseScope.new(project, User) }

  context 'on a public continuous project' do
    let!(:project) { create(:continuous_project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.not_to permit(:submission_count) }
      it { is_expected.not_to permit(:delete_inputs) }

      it 'should index the project' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.not_to permit(:submission_count) }
      it { is_expected.not_to permit(:delete_inputs) }

      it 'should index the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'should include the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:reorder) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx) }
      it { is_expected.to permit(:survey_results) }
      it { is_expected.to permit(:submission_count) }
      it { is_expected.to permit(:delete_inputs) }

      it 'should index the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'should include the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator, projects: [create(:project)]) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:delete_inputs) }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 2
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end
  end

  context 'on a continuous private admins project' do
    let!(:project) { create(:continuous_project, visible_to: 'admins') }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to permit(:delete_inputs) }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end
  end

  context 'on a private admins timeline project' do
    let!(:project) { create(:project_with_phases, visible_to: 'admins') }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.not_to permit(:submission_count) }
      it { is_expected.not_to permit(:delete_inputs) }

      it 'should not index the project'  do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.not_to permit(:submission_count) }
      it { is_expected.not_to permit(:delete_inputs) }

      it 'should not index the project'  do
        expect(scope.resolve.size).to eq 0
      end

      it 'should not include the user in the users that have access' do
        expect(inverse_scope.resolve).not_to include(user)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:reorder) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx) }
      it { is_expected.to permit(:survey_results) }
      it { is_expected.to permit(:submission_count) }
      it { is_expected.not_to permit(:delete_inputs) }

      it 'should index the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'should include the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end
  end

  context 'for a visitor on a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:reorder) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:index_xlsx) }
    it { is_expected.not_to permit(:survey_results) }
    it { is_expected.not_to permit(:submission_count) }

    it 'should not index the project'  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a private groups project where she's no member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:reorder) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:index_xlsx) }
    it { is_expected.not_to permit(:survey_results) }
    it { is_expected.not_to permit(:submission_count) }

    it 'should not index the project'  do
      expect(scope.resolve.size).to eq 0
    end

    it 'should not include the user in the users that have access' do
      expect(inverse_scope.resolve).not_to include(user)
    end
  end

  context "for a user on a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user, groups_count: 2) }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:reorder) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:index_xlsx) }
    it { is_expected.not_to permit(:survey_results) }
    it { is_expected.not_to permit(:submission_count) }

    it 'should index the project' do
      expect(scope.resolve.size).to eq 1
    end

    it 'should include the user in the users that have access' do
      expect(inverse_scope.resolve).to include(user)
    end
  end

  context 'for an admin on a private groups project' do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_groups_project) }

    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:reorder) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:index_xlsx) }
    it { is_expected.to permit(:survey_results) }
    it { is_expected.to permit(:submission_count) }

    it 'should index the project' do
      expect(scope.resolve.size).to eq 1
    end

    it 'should include the user in the users that have access' do
      expect(inverse_scope.resolve).to include(user)
    end
  end

  context 'on a draft project' do
    let!(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.not_to permit(:submission_count) }

      it 'should not index the project'  do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:survey_results) }
      it { is_expected.not_to permit(:submission_count) }

      it 'should not index the project'  do
        expect(scope.resolve.size).to eq 0
      end

      it 'should not include the user in the users that have access' do
        expect(inverse_scope.resolve).not_to include(user)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:reorder) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx) }
      it { is_expected.to permit(:survey_results) }
      it { is_expected.to permit(:submission_count) }

      it 'should index the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'should include the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:reorder) }
      it { is_expected.not_to permit(:destroy) }

      it { expect(scope.resolve).not_to include(project) }
      it { expect(inverse_scope.resolve).not_to include(user) }
    end
  end

  context 'for a continuous project contained within a folder the user moderates' do
    let!(:project) { create(:continuous_project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id }) }
    let!(:project_folder) { create(:project_folder) }
    let(:user) { build(:project_folder_moderator, project_folders: [project_folder]) }

    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:delete_inputs) }
  end

  context 'for a continuous project not contained within a folder the user moderates' do
    let!(:project) { create(:continuous_project) }
    let!(:project_folder) { create(:project_folder) }
    let(:user) { build(:project_folder_moderator, project_folders: [project_folder]) }

    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:delete_inputs) }
  end
end
