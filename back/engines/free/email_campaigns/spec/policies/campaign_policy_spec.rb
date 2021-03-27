require 'rails_helper'

describe EmailCampaigns::CampaignPolicy do
  subject { EmailCampaigns::CampaignPolicy.new(user, campaign) }
  let(:scope) { EmailCampaigns::CampaignPolicy::Scope.new(user, campaign.class) }

  context "on a manual campaign" do 
    let!(:campaign) { create(:manual_campaign) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the campaign" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a mortal user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the campaign" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should    permit(:show)    }
      it { should    permit(:create)  }
      it { should    permit(:update)  }
      it { should    permit(:destroy) }

      it "should index the campaign" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a project moderator" do
      let(:user) { create(:moderator, project: project) }

      context "of a public project" do
        let(:project) { create(:project) }

        it { should     permit(:show)    }
        it { should     permit(:create)  }
        it { should     permit(:update)  }
        it { should     permit(:destroy) }

        it "should index the campaign"  do
          expect(scope.resolve.size).to eq 1
        end
      end

      context "of a private admins project" do
        let(:project) { create(:private_admins_project) }

        it { should_not permit(:show)    }
        it { should_not permit(:create)  }
        it { should_not permit(:update)  }
        it { should_not permit(:destroy) }

        it "should not index the campaign"  do
          expect(scope.resolve.size).to eq 0
        end
      end

      context "of a private groups project on a campaign without groups" do
        let(:project) { create(:private_groups_project) }

        it { should_not permit(:show)    }
        it { should_not permit(:create)  }
        it { should_not permit(:update)  }
        it { should_not permit(:destroy) }

        it "should not index the campaign"  do
          expect(scope.resolve.size).to eq 0
        end
      end

      context "of a private groups project on a campaign with that group" do
        let(:project) { create(:private_groups_project) }
        before do
          campaign.update(groups: [project.groups.first])
        end

        it { should permit(:show)    }
        it { should permit(:create)  }
        it { should permit(:update)  }
        it { should permit(:destroy) }

        it "should index the campaign"  do
          expect(scope.resolve.size).to eq 1
        end
      end

      context "of a private groups project on a campaign with another group" do
        let(:project) { create(:private_groups_project) }
        before do
          campaign.update(groups: [create(:group)])
        end

        it { should_not permit(:show)    }
        it { should_not permit(:create)  }
        it { should_not permit(:update)  }
        it { should_not permit(:destroy) }

        it "should not index the campaign"  do
          expect(scope.resolve.size).to eq 0
        end
      end


    end
  end



  context "on an automated campaign" do 
    let!(:campaign) { create(:comment_on_your_comment_campaign) }

    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the campaign" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for a mortal user" do
      let(:user) { create(:user) }

      it { should_not permit(:show)    }
      it { should_not permit(:create)  }
      it { should_not permit(:update)  }
      it { should_not permit(:destroy) }

      it "should not index the campaign" do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should    permit(:show)    }
      it { should_not    permit(:create)  }
      it { should    permit(:update)  }
      it { should    permit(:destroy) }

      it "should index the campaign" do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a project moderator" do
      let(:user) { create(:moderator, project: project) }

      context "of a public project" do
        let(:project) { create(:project) }

        it { should_not     permit(:show)    }
        it { should_not     permit(:create)  }
        it { should_not     permit(:update)  }
        it { should_not     permit(:destroy) }

        it "should not index the campaign"  do
          expect(scope.resolve.size).to eq 0
        end
      end
    end
  end

end