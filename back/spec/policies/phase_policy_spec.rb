require 'rails_helper'

describe PhasePolicy do
  subject { PhasePolicy.new(user, phase) }
  let(:scope) { PhasePolicy::Scope.new(user, project.phases) }

  context "on phase in a public project" do 
    let(:project) { create(:project_with_phases, phases_count: 0) }
    let!(:phase) { create(:phase, project: project) }

    context "for a visitor" do
      let(:user) { nil }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the phase" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a mortal user" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the phase" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should    permit(:show)    }
      it { should    permit(:create)  }
      it { should    permit(:update)  }
      it { should    permit(:destroy) }

      it "should index the phase" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "for a visitor on a phase in a private groups project" do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project)}
    let!(:phase) { create(:phase, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should not index the phase" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a phase in a private groups project where she's no member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project)}
    let!(:phase) { create(:phase, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the phase"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a phase in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user)}
    let!(:phase) { create(:phase, project: project) }

    it { should     permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the phase"  do
      expect(scope.resolve.size).to eq 1
    end
  end

end