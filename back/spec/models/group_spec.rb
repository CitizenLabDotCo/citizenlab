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

  describe '#sanitize_title_multiloc' do
    it 'removes all HTML tags from title_multiloc' do
      group = build(
        :group,
        title_multiloc: {
          'en' => 'Something <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      group.save!

      expect(group.title_multiloc['en']).to eq('Something alert("XSS") something')
      expect(group.title_multiloc['fr-BE']).to eq('Something')
      expect(group.title_multiloc['nl-BE']).to eq('Plain text with formatting')
    end

    it 'sanitizes when escaped HTML tags present' do
      group = build(
        :group,
        title_multiloc: {
          'en' => 'Something &lt;script&gt;alert("XSS")&lt;/script&gt; something',
          'fr-BE' => 'Something &lt;img src=x onerror=alert(1)&gt;',
          'nl-BE' => 'Plain &lt;b&gt;text&lt;/b&gt; with &lt;i&gt;formatting&lt;/i&gt;'
        }
      )

      group.save!

      expect(group.title_multiloc['en']).to eq('Something alert("XSS") something')
      expect(group.title_multiloc['fr-BE']).to eq('Something')
      expect(group.title_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
