require 'rails_helper'

RSpec.describe Vote, type: :model do
  context "associations" do
    it { should belong_to(:user) }
    it { should belong_to(:votable) }
  end

  it { should define_enum_for(:mode).with([:up, :down]) }
end
