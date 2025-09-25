# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Group do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:group)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }

  it 'validates presence of slug' do
    group = build(:group)
    allow(group).to receive(:generate_slug) # Stub to do nothing
    group.slug = nil
    expect(group).to be_invalid
    expect(group.errors[:slug]).to include("can't be blank")
  end

  context 'users (members)' do
    it 'can be assigned to manual groups' do
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

    it 'can be added to and removed from manual groups' do
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

    it 'has consistent responses between member and member_ids' do
      g1 = create(:group)
      g1.members << create_list(:user, 5)
      expect(g1.member_ids).to match g1.members.map(&:id)
    end
  end

  describe 'update_memberships_count!' do
    it 'does nothing for a manual group' do
      group = build(:group)
      create_list(:membership, 2, group: group)
      expect(group).not_to receive(:update).with({ memberships_count: 2 })
      group.update_memberships_count!
    end
  end

  describe 'generate_slug' do
    let(:group) { build(:group) }

    it 'generates a slug based on the first non-empty locale' do
      group.update!(title_multiloc: { 'nl-BE' => 'titel', 'fr-BE' => 'titlefrançais' })
      expect(group.slug).to eq 'titel'
    end
  end

  describe 'search_by_title' do
    let!(:engineering_group) { create(:group, title_multiloc: { 'en' => 'Engineering Team', 'fr' => 'Équipe d\'ingénierie' }) }
    let!(:marketing_group) { create(:group, title_multiloc: { 'en' => 'Marketing Team', 'fr' => 'Équipe marketing' }) }
    let!(:design_group) { create(:group, title_multiloc: { 'en' => 'Design Committee', 'fr' => 'Comité de design' }) }

    it 'returns groups matching the search term in English' do
      results = described_class.search_by_title('Team')
      expect(results).to contain_exactly(engineering_group, marketing_group)
    end

    it 'returns groups matching the search term in French' do
      results = described_class.search_by_title('Équipe')
      expect(results).to contain_exactly(engineering_group, marketing_group)
    end

    it 'returns groups matching partial search terms' do
      results = described_class.search_by_title('Engin')
      expect(results).to contain_exactly(engineering_group)
    end

    it 'returns empty result when no groups match' do
      results = described_class.search_by_title('NonExistentTerm')
      expect(results).to be_empty
    end

    it 'returns all groups when search term is empty' do
      results = described_class.search_by_title('')
      expect(results).to contain_exactly(engineering_group, marketing_group, design_group)
    end
  end

  describe 'by_project_id' do
    let!(:project1) { create(:project) }
    let!(:project2) { create(:project) }
    
    let!(:smart_group_with_project1) do
      create(:group,
        title_multiloc: { 'en' => 'Project1 Participants' },
        membership_type: 'rules',
        rules: [{ ruleType: 'participated_in_project', predicate: 'in', value: [project1.id] }]
      )
    end
    
    let!(:smart_group_with_project2) do
      create(:group,
        title_multiloc: { 'en' => 'Project2 Participants' },
        membership_type: 'rules',
        rules: [{ ruleType: 'participated_in_project', predicate: 'posted_in', value: [project2.id] }]
      )
    end
    
    let!(:smart_group_with_both_projects) do
      create(:group,
        title_multiloc: { 'en' => 'Both Projects Participants' },
        membership_type: 'rules',
        rules: [{ ruleType: 'participated_in_project', predicate: 'commented_in', value: [project1.id, project2.id] }]
      )
    end
    
    let!(:manual_group) { create(:group, membership_type: 'manual') }
    
    let!(:other_rule_smart_group) do
      create(:group,
        title_multiloc: { 'en' => 'Role Based Group' },
        membership_type: 'rules',
        rules: [{ ruleType: 'role', predicate: 'is_admin' }]
      )
    end

    it 'returns groups with the specified project_id in their rules' do
      results = described_class.by_project_id(project1.id)
      expect(results).to contain_exactly(smart_group_with_project1, smart_group_with_both_projects)
    end

    it 'returns groups with the specified project_id in array values' do
      results = described_class.by_project_id(project2.id)
      expect(results).to contain_exactly(smart_group_with_project2, smart_group_with_both_projects)
    end

    it 'returns empty result when no groups have the project_id in their rules' do
      non_existent_project = create(:project)
      results = described_class.by_project_id(non_existent_project.id)
      expect(results).to be_empty
    end

    it 'does not return manual groups or groups with other rule types' do
      results = described_class.by_project_id(project1.id)
      expect(results).not_to include(manual_group)
      expect(results).not_to include(other_rule_smart_group)
    end
  end
end
