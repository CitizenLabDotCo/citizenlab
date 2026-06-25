# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::ParticipatedInInput do
  let(:valid_json_rule) do
    {
      'ruleType' => 'participated_in_input',
      'predicate' => 'in',
      'value' => create_list(:idea, 2).map(&:id)
    }
  end
  let(:valid_rule) { described_class.from_json(valid_json_rule) }

  describe 'from_json' do
    it 'successfully parses a valid json' do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end
  end

  describe 'validations' do
    it 'accept a rule with a mutli-value predicate and an array of values' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it 'reject a rule with a mutli-value predicate and a single value' do
      rule = valid_json_rule.tap do |r|
        r['predicate'] = 'in'
        r['value'] = Idea.first.id
      end
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end

    it 'accepts a rule with a single-value predicate and a single value' do
      rule = valid_json_rule.tap do |r|
        r['predicate'] = 'not_in'
        r['value'] = Idea.first.id
      end
      expect(described_class.from_json(rule)).to be_valid
      expect(build(:smart_group, rules: [rule])).to be_valid
    end

    it 'reject a rule with a single-value predicate and an array of values' do
      valid_json_rule['predicate'] = 'not_in'
      expect(build(:smart_group, rules: [valid_json_rule])).to be_invalid
    end

    it 'rejects a rule referencing a non-existent input' do
      rule = valid_json_rule.tap do |r|
        r['predicate'] = 'not_in'
        r['value'] = SecureRandom.uuid
      end
      expect(described_class.from_json(rule)).to be_invalid
    end
  end

  describe 'filter' do
    let_it_be(:user1) { create(:user) }
    let_it_be(:user2) { create(:user) }
    let_it_be(:user3) { create(:user) }
    let_it_be(:user4) { create(:user) }
    let_it_be(:idea1) { create(:idea, author: user1) }
    let_it_be(:reaction) { create(:reaction, reactable: idea1, user: user2) }
    let_it_be(:comment) { create(:comment, idea: idea1, author: user3) }
    let_it_be(:proposal1) { create(:proposal, author: user3) }

    it "correctly filters on 'in' predicate" do
      rule = described_class.new('in', [idea1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user3)
    end

    it "correctly filters on 'not_in' predicate" do
      rule = described_class.new('not_in', proposal1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user4)
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = described_class.new('posted_in', [idea1.id, proposal1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user3)
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = described_class.new('not_posted_in', idea1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user2, user3, user4)
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = described_class.new('commented_in', [idea1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user3)
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = described_class.new('not_commented_in', idea1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user4)
    end

    it "correctly filters on 'reacted_idea_in' predicate" do
      rule = described_class.new('reacted_idea_in', [idea1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user2)
    end

    it "correctly filters on 'not_reacted_idea_in' predicate" do
      rule = described_class.new('not_reacted_idea_in', idea1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user3, user4)
    end

    it "correctly filters on 'reacted_comment_in' predicate" do
      rule = described_class.new('reacted_comment_in', [idea1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to be_empty
    end

    it "correctly filters on 'not_reacted_comment_in' predicate" do
      rule = described_class.new('not_reacted_comment_in', proposal1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user3, user4)
    end
  end

  describe 'description_multiloc' do
    let(:cycling_path) do
      create(:idea, title_multiloc: { 'en' => 'A new cycling path' })
    end
    let(:more_trees) do
      create(:idea, title_multiloc: { 'en' => 'Plant more trees' })
    end

    it 'translates multi-value predicates (en)' do
      rule = described_class.from_json({
        'ruleType' => 'participated_in_input',
        'predicate' => 'in',
        'value' => [cycling_path.id, more_trees.id]
      })
      expect(rule.description_multiloc['en']).to eq(
        'Participation in one of the following inputs: A new cycling path, Plant more trees'
      )
    end

    it 'translates single-value predicates (en)' do
      rule = described_class.from_json({
        'ruleType' => 'participated_in_input',
        'predicate' => 'not_commented_in',
        'value' => cycling_path.id
      })
      expect(rule.description_multiloc['en']).to eq(
        'Did not comment on the input A new cycling path'
      )
    end
  end
end
