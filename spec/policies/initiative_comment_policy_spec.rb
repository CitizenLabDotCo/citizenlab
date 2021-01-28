require 'rails_helper'

describe InitiativeCommentPolicy do
  subject { InitiativeCommentPolicy.new(user, comment) }
  before do
    PermissionsService.new.update_global_permissions
  end
  let(:scope) { InitiativeCommentPolicy::Scope.new(user, initiave.comments) }

  context "on comment on initiave" do 
    let(:initiave) { create(:initiative) }
    let!(:comment) { create(:comment, post: initiave) }

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
  end

end