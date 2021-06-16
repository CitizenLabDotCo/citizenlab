require 'rails_helper'

describe ProjectImagePolicy do
  subject { ProjectImagePolicy.new(user, image) }
  let(:scope) { ProjectImagePolicy::Scope.new(user, project.project_images) }

  context "on an image in a public project" do 
    let(:project) { create(:continuous_project) }
    let!(:image) { create(:project_image, project: project)}

	  context "for a visitor" do 
	  	let(:user) { nil }

	    it { should     permit(:show)    }
	    it { should_not permit(:create)  }
	    it { should_not permit(:update)  }
	    it { should_not permit(:destroy) }

	    it "should index the image" do
	      expect(scope.resolve.size).to eq 1
	    end
	  end

	  context "for a mortal user" do
      let(:user) { create(:user) }

      it { should     permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should index the image" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the image" do
        expect(scope.resolve.size).to eq 1
      end
    end
	end

	 context "on an image in a private admins project" do 
	 	let(:project) { create(:private_admins_project) }
    let!(:image) { create(:project_image, project: project)}

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the image" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }

      it "should index the image" do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

end
    
