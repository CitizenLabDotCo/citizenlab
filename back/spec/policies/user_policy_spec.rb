require 'rails_helper'

describe UserPolicy do
  subject { UserPolicy.new(current_user, subject_user) }
  let(:scope) { UserPolicy::Scope.new(current_user, User) }

  context "for a visitor" do
    let(:current_user) { nil }
    let(:subject_user) { create(:user) }

    it { should     permit(:show)    }
    it { should     permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it { should_not permit(:index) }
    it { should_not permit(:index_xlsx) }

    it "should index the user through the scope" do
      subject_user.save
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a user" do
    let(:current_user) { create(:user) }

    context "on theirself" do
      let(:subject_user) { current_user }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should     permit(:update)  }
      it { should     permit(:destroy) }
      it { should_not permit(:index) }
      it { should_not permit(:index_xlsx) }

      it "should index the user through the scope" do
        subject_user.save
        expect(scope.resolve.size).to eq 1
      end
    end

    context "on someone else" do
      let(:subject_user) { create(:user) }

      it { should     permit(:show)    }
      it { should     permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }
      it { should_not permit(:index) }
      it { should_not permit(:index_xlsx) }

      it "should index the users through the scope" do
        subject_user.save
        expect(scope.resolve.size).to eq 2
      end
    end
  end

  context "for an admin" do
    let(:current_user) { create(:admin) }

    context "on theirself" do
      let(:subject_user) { current_user }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }
      it { should permit(:index) }
      it { should permit(:index_xlsx) }

      it "should index the user through the scope" do
        subject_user.save
        expect(scope.resolve.size).to eq 1
      end
    end

    context "on someone else" do
      let(:subject_user) { create(:user) }

      it { should permit(:show)    }
      it { should permit(:create)  }
      it { should permit(:update)  }
      it { should permit(:destroy) }
      it { should permit(:index) }
      it { should permit(:index_xlsx) }

      it "should index the users through the scope" do
        subject_user.save
        expect(scope.resolve.size).to eq 2
      end
    end
  end

end