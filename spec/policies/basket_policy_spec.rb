require 'rails_helper'

describe BasketPolicy do
  subject { BasketPolicy.new(user, basket) }
  let(:basket) { create(:basket) }

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
end