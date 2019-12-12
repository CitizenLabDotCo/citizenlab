require 'rails_helper'

describe Verification::IdCardPolicy do

  subject { Verification::IdCardPolicy.new(user, id_card) }
  let!(:id_card) { build(:verification_id_card) }

  context "for a visitor" do 
    let(:user) { nil }

    it { should_not permit(:bulk_replace) }
    it { should_not permit(:count) }
  end

  context "for a normal user" do 
    let(:user) { create(:user) }

    it { should_not permit(:bulk_replace) }
    it { should_not permit(:count) }
  end

  context "for an admin" do 
    let(:user) { create(:admin) }

    it { should permit(:bulk_replace) }
    it { should permit(:count) }
  end

end
