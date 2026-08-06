# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::ParticipatedInIdeaStatus do
  let(:valid_json_rule) do
    {
      'ruleType' => 'participated_in_idea_status',
      'predicate' => 'in',
      'value' => create_list(:idea_status, 2).map(&:id)
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
        r['value'] = IdeaStatus.first.id
      end
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end

    it 'accepts a rule with a single-value predicate and a single value' do
      rule = valid_json_rule.tap do |r|
        r['predicate'] = 'not_in'
        r['value'] = IdeaStatus.first.id
      end
      expect(described_class.from_json(rule)).to be_valid
      expect(build(:smart_group, rules: [rule])).to be_valid
    end

    it 'reject a rule with a single-value predicate and an array of values' do
      valid_json_rule['predicate'] = 'not_in'
      expect(build(:smart_group, rules: [valid_json_rule])).to be_invalid
    end
  end

  describe 'filter' do
    let_it_be(:idea_status1) { create(:idea_status) }
    let_it_be(:proposal_status1) { create(:proposals_status) }
    let_it_be(:user1) { create(:user) }
    let_it_be(:user2) { create(:user) }
    let_it_be(:user3) { create(:user) }
    let_it_be(:user4) { create(:user) }
    let_it_be(:idea1) { create(:idea, idea_status: idea_status1, author: user1) }
    let_it_be(:reaction) { create(:reaction, reactable: idea1, user: user2) }
    let_it_be(:comment) { create(:comment, idea: idea1, author: user3) }
    let_it_be(:proposal1) { create(:proposal, idea_status: proposal_status1, author: user3) }

    it "correctly filters on 'in' predicate" do
      rule = described_class.new('in', [idea_status1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user3)
    end

    it "correctly filters on 'not_in' predicate" do
      rule = described_class.new('not_in', proposal_status1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user4)
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = described_class.new('posted_in', [idea_status1.id, proposal_status1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user3)
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = described_class.new('not_posted_in', idea_status1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user2, user3, user4)
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = described_class.new('commented_in', [idea_status1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user3)
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = described_class.new('not_commented_in', idea_status1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user4)
    end

    it "correctly filters on 'reacted_idea_in' predicate" do
      rule = described_class.new('reacted_idea_in', [idea_status1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user2)
    end

    it "correctly filters on 'not_reacted_idea_in' predicate" do
      rule = described_class.new('not_reacted_idea_in', idea_status1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user3, user4)
    end

    it "correctly filters on 'reacted_comment_in' predicate" do
      rule = described_class.new('reacted_comment_in', [idea_status1.id])
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to be_empty
    end

    it "correctly filters on 'not_reacted_comment_in' predicate" do
      rule = described_class.new('not_reacted_comment_in', proposal_status1.id)
      expect { @users = rule.filter(User) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly(user1, user2, user3, user4)
    end
  end

  describe 'description_multiloc' do
    let(:garbage_status) do
      create(:idea_status, title_multiloc: {
        'en' => 'in the garbage can',
        'fr-FR' => 'dans la poubelle',
        'nl-NL' => 'in de prullenmand'
      })
    end
    let(:delayed_status) do
      create(:idea_status, title_multiloc: {
        'en' => 'delayed',
        'fr-FR' => 'retardé',
        'nl-NL' => 'uitgesteld'
      })
    end

    let(:participated_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'in',
        'value' => [garbage_status.id, delayed_status.id]
      })
    end
    let(:participated_not_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'not_in',
        'value' => garbage_status.id
      })
    end
    let(:participated_posted_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'posted_in',
        'value' => [garbage_status.id]
      })
    end
    let(:participated_not_posted_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'not_posted_in',
        'value' => garbage_status.id
      })
    end
    let(:participated_commented_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'commented_in',
        'value' => [garbage_status.id, delayed_status.id]
      })
    end
    let(:participated_not_commented_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'not_commented_in',
        'value' => garbage_status.id
      })
    end
    let(:participated_reacted_idea_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'reacted_idea_in',
        'value' => [garbage_status.id]
      })
    end
    let(:participated_not_reacted_idea_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'not_reacted_idea_in',
        'value' => garbage_status.id
      })
    end
    let(:participated_reacted_comment_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'reacted_comment_in',
        'value' => [garbage_status.id, delayed_status.id]
      })
    end
    let(:participated_not_reacted_comment_in_idea_status_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_idea_status',
        'predicate' => 'not_reacted_comment_in',
        'value' => garbage_status.id
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(participated_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Participation in an idea with one of the following statuses in the garbage can, delayed',
        'fr-FR' => 'Participation dans une idée avec statut est un de dans la poubelle, retardé',
        'nl-NL' => 'Participatie in een idee met één van de volgende statussen in de prullenmand, uitgesteld'
      })
      expect(participated_not_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'No participation in an idea with status in the garbage can',
        'fr-FR' => 'Pas de participation dans une idée avec statut dans la poubelle',
        'nl-NL' => 'Geen participatie in een idea met status in de prullenmand'
      })
      expect(participated_posted_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Posted an idea with one of the following statuses in the garbage can',
        'fr-FR' => 'Posté une idée avec statut est un de dans la poubelle',
        'nl-NL' => 'Plaatste een idee met één van de volgende statussen in de prullenmand'
      })
      expect(participated_not_posted_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Did not post an idea with status in the garbage can',
        'fr-FR' => 'N\'as pas posté une idée avec statut dans la poubelle',
        'nl-NL' => 'Plaatste geen idee met status in de prullenmand'
      })
      expect(participated_commented_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Commented on an idea with one of the following statuses in the garbage can, delayed',
        'fr-FR' => 'Commenté sur une idée avec statut est un de dans la poubelle, retardé',
        'nl-NL' => 'Reageerde op een idee met één van de volgende statussen in de prullenmand, uitgesteld'
      })
      expect(participated_not_commented_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Did not comment on an idea with status in the garbage can',
        'fr-FR' => 'N\'as pas commenté sur une idée avec statut dans la poubelle',
        'nl-NL' => 'Reageerde niet op een idee met status in de prullenmand'
      })
      expect(participated_reacted_idea_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Reacted to an idea with one of the following statuses in the garbage can',
        'fr-FR' => 'Reacted to an idea with one of the following statuses dans la poubelle',
        'nl-NL' => 'Reacted to an idea with one of the following statuses in de prullenmand'
      })
      expect(participated_not_reacted_idea_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Did not react to an idea with status in the garbage can',
        'fr-FR' => 'Did not react to an idea with status dans la poubelle',
        'nl-NL' => 'Did not react to an idea with status in de prullenmand'
      })
      expect(participated_reacted_comment_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Reacted to a comment on an idea with one of the following statuses in the garbage can, delayed',
        'fr-FR' => 'Reacted to a comment on an idea with one of the following statuses dans la poubelle, retardé',
        'nl-NL' => 'Reacted to a comment on an idea with one of the following statuses in de prullenmand, uitgesteld'
      })
      expect(participated_not_reacted_comment_in_idea_status_in_rule.description_multiloc).to eq({
        'en' => 'Did not react to a comment on an idea with status in the garbage can',
        'fr-FR' => 'Did not react to a comment on an idea with status dans la poubelle',
        'nl-NL' => 'Did not react to a comment on an idea with status in de prullenmand'
      })
    end
  end
end
