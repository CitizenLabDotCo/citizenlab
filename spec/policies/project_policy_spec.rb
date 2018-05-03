require 'rails_helper'

describe ProjectPolicy do
  subject { ProjectPolicy.new(user, project) }
  let(:scope) { ProjectPolicy::Scope.new(user, Project) }

  context "on a public project" do 
    let!(:project) { create(:project) }
    context "for a visitor" do
      let(:user) { nil }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the project"  do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the project"  do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the project"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "on a private admins project" do 
    let!(:project) { create(:private_admins_project) }
    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the project"  do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the project"  do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the project"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "for a visitor on a private groups project" do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project)}

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should not index the project"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a private groups project where she's no member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project)}

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the project"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user)}

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should index the project"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a user on a private groups project where she's no member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group])}

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the project"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a private groups project where she's a member of a rules group with access" do
    let!(:user) { create(:user, email: 'user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group])}

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should index the project"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin on a private groups project" do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_groups_project)}

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }

    it "should index the project"  do
      expect(scope.resolve.size).to eq 1
    end

  end

  context "on a draft project" do 
    let!(:project) { create(:project, publication_status: 'draft') }
    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the project"  do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the project"  do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the project"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end