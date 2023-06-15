# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::ParticipatedInProject do
  let(:valid_json_rule) do
    {
      'ruleType' => 'participated_in_project',
      'predicate' => 'in',
      'value' => create_list(:project, 2).map(&:id)
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
    it 'accepts a rule with a mutli-value predicate and an array of values' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it 'rejects a rule with a mutli-value predicate and a single value' do
      rule = valid_json_rule.tap do |r|
        r['predicate'] = 'in'
        r['value'] = Project.first.id
      end
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end

    it 'accepts a rule with a single-value predicate and a single value' do
      rule = valid_json_rule.tap do |r|
        r['predicate'] = 'not_in'
        r['value'] = Project.first.id
      end
      expect(described_class.from_json(rule)).to be_valid
      expect(build(:smart_group, rules: [rule])).to be_valid
    end

    it 'rejects a rule with a single-value predicate and an array of values' do
      valid_json_rule['predicate'] = 'not_in'
      expect(build(:smart_group, rules: [valid_json_rule])).to be_invalid
    end
  end

  describe 'filter' do
    before do
      @project1 = create(:project)
      @project2 = create(:project)
      @user1 = create(:user)
      @user2 = create(:user)
      @user3 = create(:user)
      @idea1 = create(:idea, project: @project1, author: @user1)
      @reaction = create(:reaction, reactable: @idea1, user: @user2)
      @comment = create(:comment, post: @idea1, author: @user3)
      @idea2 = create(:idea, project: @project2, author: @user3)
    end

    it "correctly filters on 'in' predicate" do
      rule = described_class.new('in', [@project1.id])
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user3.id]
    end

    it "correctly filters on 'not_in' predicate" do
      rule = described_class.new('not_in', @project2.id)
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id]
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = described_class.new('posted_in', [@project1.id, @project2.id])
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user3.id]
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = described_class.new('not_posted_in', @project1.id)
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user2.id, @user3.id]
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = described_class.new('commented_in', [@project1.id])
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user3.id]
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = described_class.new('not_commented_in', @project1.id)
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id]
    end

    it "correctly filters on 'reacted_idea_in' predicate" do
      rule = described_class.new('reacted_idea_in', [@project1.id])
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user2.id]
    end

    it "correctly filters on 'not_reacted_idea_in' predicate" do
      rule = described_class.new('not_reacted_idea_in', @project1.id)
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user3.id]
    end

    it "correctly filters on 'reacted_comment_in' predicate" do
      rule = described_class.new('reacted_comment_in', [@project1.id])
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array []
    end

    it "correctly filters on 'not_reacted_comment_in' predicate" do
      rule = described_class.new('not_reacted_comment_in', @project2.id)
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user3.id]
    end

    it "correctly filters on 'budgeted_in' predicate" do
      rule = described_class.new('budgeted_in', [@project1.id])
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array []
    end

    it "correctly filters on 'not_budgeted_in' predicate" do
      rule = described_class.new('not_budgeted_in', @project2.id)
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user3.id]
    end

    it "correctly filters on 'volunteered_in' predicate" do
      rule = described_class.new('volunteered_in', [@project1.id])
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array []
    end

    it "correctly filters on 'not_volunteered_in' predicate" do
      rule = described_class.new('not_volunteered_in', @project2.id)
      expect { @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user3.id]
    end
  end

  describe 'description_multiloc' do
    let(:project1) do
      create(:project, title_multiloc: {
        'en' => 'beer',
        'fr-FR' => 'bière',
        'nl-NL' => 'bier'
      })
    end
    let(:project2) do
      create(:project, title_multiloc: {
        'en' => 'delayed',
        'fr-FR' => 'retardé',
        'nl-NL' => 'uitgesteld'
      })
    end

    let(:participated_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'in',
        'value' => [project1.id, project2.id]
      })
    end
    let(:participated_not_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'not_in',
        'value' => project1.id
      })
    end
    let(:participated_posted_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'posted_in',
        'value' => [project1.id, project2.id]
      })
    end
    let(:participated_not_posted_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'not_posted_in',
        'value' => project1.id
      })
    end
    let(:participated_commented_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'commented_in',
        'value' => [project1.id, project2.id]
      })
    end
    let(:participated_not_commented_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'not_commented_in',
        'value' => project1.id
      })
    end
    let(:participated_reacted_idea_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'reacted_idea_in',
        'value' => [project1.id, project2.id]
      })
    end
    let(:participated_not_reacted_idea_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'not_reacted_idea_in',
        'value' => project1.id
      })
    end
    let(:participated_reacted_comment_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'reacted_comment_in',
        'value' => [project1.id, project2.id]
      })
    end
    let(:participated_not_reacted_comment_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'not_reacted_comment_in',
        'value' => project1.id
      })
    end
    let(:participated_budgeted_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'budgeted_in',
        'value' => [project1.id, project2.id]
      })
    end
    let(:participated_not_budgeted_in_project_in_rule) do
      described_class.from_json({
        'ruleType' => 'participated_in_project',
        'predicate' => 'not_budgeted_in',
        'value' => project1.id
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(participated_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Participation in an idea in one of the following projects beer, delayed',
        'fr-FR' => "Participation à une idée dans l'un des projets bière, retardé",
        'nl-NL' => 'Participatie in een idee in een van de volgende projecten bier, uitgesteld'
      })
      expect(participated_not_in_project_in_rule.description_multiloc).to eq({
        'en' => 'No participation in an idea in the project beer',
        'fr-FR' => 'Pas de participation dans une idée dans le projet bière',
        'nl-NL' => 'Geen participatie in een idee in het project bier'
      })
      expect(participated_posted_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Posted an idea in one of the following projects beer, delayed',
        'fr-FR' => 'Posté une idée dans l\'un des projets bière, retardé',
        'nl-NL' => 'Plaatste een idee in een van de volgende projecten bier, uitgesteld'
      })
      expect(participated_not_posted_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Did not post an idea in the project beer',
        'fr-FR' => 'N\'as pas posté une idée dans le projet bière',
        'nl-NL' => 'Plaatste geen idee in het project bier'
      })
      expect(participated_commented_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Commented on an idea in one of the following projects beer, delayed',
        'fr-FR' => 'Commenté sur une idée dans l\'un des projets bière, retardé',
        'nl-NL' => 'Reageerde op een idee in een van de volgende projecten bier, uitgesteld'
      })
      expect(participated_not_commented_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Did not comment on an idea in the project beer',
        'fr-FR' => 'N\'as pas commenté sur une idée dans le projet bière',
        'nl-NL' => 'Reageerde niet op een idee in het project bier'
      })
      expect(participated_reacted_idea_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Reacted to an idea in one of the following projects beer, delayed',
        'fr-FR' => 'Voté pour une idée dans l\'un des projets bière, retardé',
        'nl-NL' => 'Stemde op een idee in een van de volgende projecten bier, uitgesteld'
      })
      expect(participated_not_reacted_idea_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Did not react to an idea in the project beer',
        'fr-FR' => 'N\'as pas voté pour une idée dans le projet bière',
        'nl-NL' => 'Stemde niet op een idee in het project bier'
      })
      expect(participated_reacted_comment_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Reacted to a comment on an idea in one of the following projects beer, delayed',
        'fr-FR' => 'Voté pour un commentaire sur une idée dans l\'un des projets bière, retardé',
        'nl-NL' => 'Stemde op een reactie op een idee in een van de volgende projecten bier, uitgesteld'
      })
      expect(participated_not_reacted_comment_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Did not react to a comment on an idea in the project beer',
        'fr-FR' => 'N\'as pas voté pour un commentaire sur une idée dans le projet bière',
        'nl-NL' => 'Stemde niet op een reactie op een idee in het project bier'
      })
      expect(participated_budgeted_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Assigned a budget in one of the following projects beer, delayed',
        'fr-FR' => 'Dépensé un budget dans l\'un des projets bière, retardé',
        'nl-NL' => 'Wees een budget toe in een van de volgende projecten bier, uitgesteld'
      })
      expect(participated_not_budgeted_in_project_in_rule.description_multiloc).to eq({
        'en' => 'Didn\'t assign a budget in the project beer',
        'fr-FR' => 'N\'as pas dépensé un budget dans le projet bière',
        'nl-NL' => 'Wees geen budget toe in het project bier'
      })
    end
  end
end
