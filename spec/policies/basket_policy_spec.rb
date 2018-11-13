require 'rails_helper'

describe BasketPolicy do
  subject { BasketPolicy.new(user, basket) }
  let(:basket) { create(:basket, participation_context: create(:continuous_budgeting_project, with_permissions: true)) }

  context "for a visitor" do
    let(:user) { nil }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
  end

  context "for a user who is not the basket owner" do
    let(:user) { create(:user) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
  end

  context "for a user who is the basket owner" do
    let(:user) { basket.user }

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end

  context "for an admin" do
    let(:user) { create(:admin) }

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end

  context "for a moderator of the project to which the basket belongs" do
    let(:user) { create(:moderator, project: basket.participation_context.project) }

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end

  context "for a moderator of another project" do
    let(:user) { create(:moderator, project: create(:project)) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
  end

  context "for a user on a basket in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_budgeting_project, with_permissions: true)}
    let!(:basket) { create(:basket, user: user, participation_context: project) }

    it { should     permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
  end

  context "for a user on a basket in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_budgeting_project, user: user, with_permissions: true)}
    let!(:basket) { create(:basket, user: user, participation_context: project) }

    it { should permit(:show)    }
    it { should permit(:create)  }
    it { should permit(:update)  }
    it { should permit(:destroy) }
  end

  context "for a mortal user who owns the basket in a project where budgeting is not permitted" do
    let!(:user) { create(:user) }
    let!(:project) { 
      p = create(:continuous_budgeting_project, with_permissions: true) 
      p.permissions.find_by(action: 'budgeting').update!(permitted_by: 'admins_moderators')
      p
    }
    let!(:basket) { create(:basket, user: user, participation_context: project) }

    it { should     permit(:show) }
    it { should_not permit(:create) }
    it { should_not permit(:update) }
    it { should_not permit(:destroy) }
  end
end