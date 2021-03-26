require 'rails_helper'

describe GroupPolicy do
  subject { GroupPolicy.new(user, group) }
  let(:scope) { GroupPolicy::Scope.new(user, Group) }

  context "on normal group" do 
    let!(:group) { create(:group) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the group" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a mortal user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the group" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should    permit(:show)    }
      it { should    permit(:create)  }
      it { should    permit(:update)  }
      it { should    permit(:destroy) }

      it "should index the group" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a project moderator" do
      let(:user) { create(:moderator, project: project) }

      context "of a public project" do
        let(:project) { create(:project) }

        it { should     permit(:show)    }
        it { should_not permit(:create)  }
        it { should_not permit(:update)  }
        it { should_not permit(:destroy) }

        it "should index the group"  do
          expect(scope.resolve.size).to eq 1
        end
      end

      context "of a private admins project" do
        let(:project) { create(:private_admins_project) }

        it { should_not permit(:show)    }
        it { should_not permit(:create)  }
        it { should_not permit(:update)  }
        it { should_not permit(:destroy) }

        it "should not index the group"  do
          expect(scope.resolve.size).to eq 0
        end
      end

      context "of a private groups project with the group" do
        let(:project) { create(:private_groups_project) }
        before do
          project.update(groups: [group])
        end

        it { should permit(:show)    }
        it { should_not permit(:create)  }
        it { should_not permit(:update)  }
        it { should_not permit(:destroy) }

        it "should index the group"  do
          expect(scope.resolve.size).to eq 1
        end
      end

      context "of a private groups project with another group" do
        let(:project) { create(:private_groups_project) }

        it { should_not permit(:show)    }
        it { should_not permit(:create)  }
        it { should_not permit(:update)  }
        it { should_not permit(:destroy) }

        it "should index the other group only"  do
          expect(scope.resolve.ids).to eq [project.groups.first.id]
        end
      end

    end
  end

end