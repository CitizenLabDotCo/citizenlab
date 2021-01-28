require 'rails_helper'

describe IdeaPolicy do
  subject { IdeaPolicy.new(user, idea) }
  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }

  context "on idea in a public project" do
    let(:project) { create(:continuous_project, with_permissions: true) }
    let!(:idea) { create(:idea, project: project) }

    context "for a visitor" do
      let(:user) { nil }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user who is not the idea author" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user who didn't complete registration who is the idea author" do
      let(:user) { idea.author.update(registration_completed_at: nil); idea.author }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end


    context "for a user who is the idea author" do
      let(:user) { idea.author }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should     permit(:update)  }
      it { should     permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator" do
      let(:user) { create(:moderator, project: project) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "on idea in a private admins project" do
    let(:project) { create(:private_admins_project, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator" do
      let(:user) { create(:moderator, project: project) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "for a visitor on an idea in a private groups project" do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should not index the idea" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the idea"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a user on an idea in a private groups project where she's not member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group], with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the idea"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a rules group with access" do
    let!(:user) { create(:user, email: 'user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group], with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin on an idea in a private groups project" do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_groups_project, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }

    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user who owns the idea in a project where posting is not permitted" do
    let!(:user) { create(:user) }
    let!(:project) {
      p = create(:continuous_project, with_permissions: true, posting_enabled: false)
      p.permissions.find_by(action: 'posting_idea').update!(permitted_by: 'admins_moderators')
      p
    }
    let!(:idea) { create(:idea, author: user, project: project) }

    it { should     permit(:show) }
    it { should_not permit(:create) }
    it { should     permit(:update) }
    it { should     permit(:destroy) }
    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "on idea in a draft project" do
    let(:project) { create(:project, admin_publication_attributes: {publication_status: 'draft'}, with_permissions: true)}
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "on idea for a survey project" do
    let(:project) { create(:continuous_survey_project, with_permissions: true) }
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author) }

    context "for a visitor" do
      let(:user) { nil }

      it { should permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for the author" do
      let(:user) { author }

      it { should permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "on idea for a project of which the last phase has ended" do
    let(:project) {
      pj = create(:project_with_current_phase, phases_config: {sequence: "xxc"}, with_permissions: true)
      current_phase = pj.phases.sort_by(&:start_at).last
      current_phase.destroy!
      pj.reload
    }
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author, phases: project.phases) }

    context "for a visitor" do
      let(:user) { nil }

      it { should permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for the author" do
      let(:user) { author }

      it { should permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the idea" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
