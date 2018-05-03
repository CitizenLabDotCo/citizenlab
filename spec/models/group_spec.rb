require 'rails_helper'

RSpec.describe Group, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:group)).to be_valid
    end
  end

  context "users (members)" do
    it "can be assigned to manual groups" do
      g1 = create(:group)
      expect(g1.members).to be_empty
      g2 = create(:group)
      u1_g1 = create(:user) # member group one
      g1.members << u1_g1
      expect(u1_g1.groups).to include(g1)
      expect(u1_g1.groups).not_to include(g2)
      u2_g2 = create(:user) # member group two
      g2.members << u2_g2
      expect(u2_g2.groups).to include(g2)
      expect(u2_g2.groups).not_to include(g1)
      u3_g1_g2 = create(:user) # member group one and two
      g1.members << u3_g1_g2
      g2.members << u3_g1_g2
      expect(u3_g1_g2.groups).to include(g1)
      expect(u3_g1_g2.groups).to include(g2)
      u4 = create(:user) # member of no group
      expect(u4.groups).to be_empty
    end

    it "can be added to and removed from manual groups" do
      g = create(:group)
      expect(g.members).to be_empty
      u1 = create(:user)
      u2 = create(:user)

      g.add_member u1
      g.add_member u2
      g.reload
      expect(u1.groups).to include(g)
      expect(u2.groups).to include(g)

      g.remove_member u1
      g.reload
      expect(u1.reload.groups).not_to include(g)
      expect(u2.reload.groups).to include(g)

      g.remove_member u2
      g.reload
      expect(u2.reload.groups).not_to include(g)
      expect(g.members).to be_empty
    end

    it "can not be added to rules groups" do
      g = create(:smart_group)
      expect{g.add_member create(:user)}.to raise_error
    end

    it "can not be deleted from rules groups" do
      g = create(:smart_group)
      expect{g.remove_member create(:user)}.to raise_error
    end

    it "has consistent responses between member and member_ids for rules groups" do
      g1 = create(:group)
      g1.members << create_list(:user, 5)
      members = g1.members
      expect(g1.member_ids).to match g1.members.map(&:id)
    end

    # Currently pending until email ends_on rule is supported
    pending "has consistent responses between member and member_ids for rules groups" do
      g1 = create(:smart_group)
      create(:user, email: 'u1@test.com')
      create(:user, email: 'u2@test.com')
      create(:user, email: 'u3@not-in-group.com')
      members = g1.members
      expect(g1.member_ids).to match g1.members.map(&:id)
      expect(2).to eq(3)
    end

  end

  describe "using_custom_field scope" do
    let(:cf1) { create(:custom_field_select)}
    let(:cf2) { create(:custom_field)}
    let!(:group1) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'ends_on', value: '@citizenlab.co'},
      {ruleType: 'custom_field_select', customFieldId: cf1.id, predicate: 'is_empty'}
    ]) }
    let!(:group2) { create(:group) }
    let!(:group3) { create(:smart_group, rules: [
      {ruleType: 'custom_field_text', customFieldId: cf2.id, predicate: 'is', value: 'abc'}
    ])}

    it "returns exactly the rules groups that reference the given custom field" do
      expect(Group.using_custom_field(cf1).all).to match [group1]
      expect(Group.using_custom_field(cf2).all).to match [group3]
    end
  end

  describe "using_custom_field_option scope" do
    let(:cf1) { create(:custom_field_select)}
    let!(:cfo1) { create_list(:custom_field_option, 3, custom_field: cf1) }
    let(:cf2) { create(:custom_field_select)}
    let!(:cfo2) { create_list(:custom_field_option, 3, custom_field: cf2) }

    let!(:group1) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'ends_on', value: '@citizenlab.co'},
      {ruleType: 'custom_field_select', customFieldId: cf1.id, predicate: 'has_value', value: cfo1[0].id}
    ]) }
    let!(:group2) { create(:group) }
    let!(:group3) { create(:smart_group, rules: [
      {ruleType: 'custom_field_select', customFieldId: cf2.id, predicate: 'has_value', value: cfo2[1].id}
    ])}

    it "returns exactly the rules groups that reference the given custom field option" do
      expect(Group.using_custom_field_option(cfo1[0]).all).to match [group1]
      expect(Group.using_custom_field_option(cfo1[1]).all).to match []
      expect(Group.using_custom_field_option(cfo1[2]).all).to match []
      expect(Group.using_custom_field_option(cfo2[0]).all).to match []
      expect(Group.using_custom_field_option(cfo2[1]).all).to match [group3]
      expect(Group.using_custom_field_option(cfo2[2]).all).to match []
    end
  end
end
