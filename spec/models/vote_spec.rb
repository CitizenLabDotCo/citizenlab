require 'rails_helper'

RSpec.describe Vote, type: :model do
  it { should define_enum_for(:mode).with(Vote::MODES) }

  context "associations" do
    it { should belong_to(:user) }
    it { should belong_to(:votable) }
  end
end
