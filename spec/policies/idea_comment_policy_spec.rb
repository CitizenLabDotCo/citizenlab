require 'rails_helper'

describe IdeaCommentPolicy do
  subject { IdeaCommentPolicy.new(user, comment) }
  let(:scope) { IdeaCommentPolicy::Scope.new(user, idea.comments) }

  context "on comment on idea in a public project" do 
    let(:project) { create(:continuous_project, with_permissions: true) }
    let(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea) }

    context "for a visitor" do
      let(:user) { nil }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the comment" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user who is not the author of the comment" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the comment" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user who is the author of the comment" do
      let(:user) { comment.author }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should     permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the comment" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should     permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the comment" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator" do
      let(:user) { create(:moderator, project: project) }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should     permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the comment"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "for a visitor on a comment on an idea in a private groups project" do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should not index the comment" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a comment on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_project, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the comment"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a comment on an idea in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_project, user: user, with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea, author: user) }

    it { should     permit(:show)    }
    it { should     permit(:create)  }
    it { should     permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the comment"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a mortal user who owns the comment in a project where commenting is not permitted" do
    let!(:user) { create(:user) }
    let!(:project) { 
      p = create(:continuous_budgeting_project, with_permissions: true) 
      p.permissions.find_by(action: 'commenting_idea').update!(permitted_by: 'admins_moderators')
      p
    }
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea, author: user) }

    it { should     permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:update) }
    it { should_not permit(:destroy) }
    it "should index the comment"  do
      expect(scope.resolve.size).to eq 1
    end
  end

end