require 'rails_helper'

describe IdeaFilePolicy do
  subject { IdeaFilePolicy.new(user, file) }
  let(:scope) { IdeaFilePolicy::Scope.new(user, idea.idea_files) }

  context "on a file of an idea in a public project" do 
    let(:project) { create(:continuous_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:file) { create(:idea_file, idea: idea)}

	  context "for a visitor" do 
	  	let(:user) { nil }

	    it { should     permit(:show)    }
	    it { should_not permit(:create)  }
	    it { should_not permit(:update)  }
	    it { should_not permit(:destroy) }

	    it "should index the file" do
	      expect(scope.resolve.size).to eq 1
	    end
	  end

	  context "for a user who is not the idea author" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the file" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user who is the idea author" do
      let(:user) { idea.author }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should     permit(:update)  }
      it { should     permit(:destroy) }

      it "should index the file" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the file" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator" do
      let(:user) { create(:moderator, project: project) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the file"  do
        expect(scope.resolve.size).to eq 1
      end
    end
	end

	 context "on a file of an idea in a private admins project" do 
	 	let(:project) { create(:private_admins_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:file) { create(:idea_file, idea: idea)}

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the file" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the file" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

end
    
