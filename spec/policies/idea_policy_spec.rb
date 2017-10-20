require 'rails_helper'

describe IdeaPolicy do
  subject { IdeaPolicy.new(user, idea) }
  let(:scope) { IdeaPolicy::Scope.new(user, Idea) }

  context "on idea without a project" do 
    let(:idea) { create(:idea) }

    context "for a visitor" do
      let(:user) { nil }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }
    end
  end

  context "for a visitor on an idea in a private project" do
    let!(:user) { nil }
    let!(:project) { create(:private_project)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should not index the idea" do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private project where she's no member of a group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_project)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the idea"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private project where she's a member of a group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_project, user: user)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin on an idea in a private project" do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_project)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }

    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end

  end
end