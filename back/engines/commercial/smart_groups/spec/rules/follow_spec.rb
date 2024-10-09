# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::Follow do
  let(:valid_json_rule) do
    {
      'ruleType' => 'follow',
      'predicate' => 'is_one_of_projects',
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
        r['predicate'] = 'is_one_of_projects'
        r['value'] = Project.first.id
      end
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end

    it 'accepts a rule with a single-value predicate and a single value' do
      valid_json_rule['predicate'] = 'is_not_project'
      valid_json_rule['value'] = Project.first.id
      expect(described_class.from_json(valid_json_rule)).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it 'rejects a rule with a single-value predicate and an array of values' do
      rule = valid_json_rule.tap { |r| r['predicate'] = 'is_not_project' }
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end

    it 'accepts a rule with a valueless predicate and no value' do
      valid_json_rule['predicate'] = 'something'
      valid_json_rule.delete 'value'
      expect(described_class.from_json(valid_json_rule)).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it 'rejects a rule with a valueless predicate and a value' do
      rule = valid_json_rule.tap do |r|
        r['predicate'] = 'something'
        r['value'] = Project.first.id
      end
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end
  end

  describe 'filter' do
    let_it_be(:project1) { create(:project) }
    let_it_be(:project2) { create(:project) }
    let_it_be(:folder) { create(:project_folder) }
    let_it_be(:idea1) { create(:idea) }
    let_it_be(:idea2) { create(:idea) }
    let_it_be(:topic) { create(:topic) }
    let_it_be(:area) { create(:area) }
    let_it_be(:user1) { create(:user) }
    let_it_be(:user2) { create(:user) }
    let_it_be(:user3) { create(:user) }
    let_it_be(:user4) { create(:user) }
    let_it_be(:user5) { create(:user) }
    let_it_be(:user6) { create(:user) }
    let_it_be(:user7) { create(:user) }

    before_all do
      create(:follower, followable: project1, user: user1)
      create(:follower, followable: project1, user: user2)
      create(:follower, followable: project2, user: user2)
      create(:follower, followable: project2, user: user3)
      create(:follower, followable: folder, user: user4)
      create(:follower, followable: idea1, user: user4)
      create(:follower, followable: idea2, user: user5)
      create(:follower, followable: topic, user: user5)
      create(:follower, followable: area, user: user6)
    end

    let(:users_scope) { User.where(id: [user1.id, user2.id, user3.id, user4.id, user5.id, user6.id, user7.id]) }

    it "correctly filters on 'something' predicate" do
      rule = described_class.new('something')
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user1, user2, user3, user4, user5, user6
    end

    it "correctly filters on 'nothing' predicate" do
      rule = described_class.new('nothing')
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user7
    end

    it "correctly filters on 'is_one_of_projects' predicate" do
      rule = described_class.new('is_one_of_projects', [project1.id, project2.id])
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user1, user2, user3
    end

    it "correctly filters on 'is_not_project' predicate" do
      rule = described_class.new('is_not_project', project1.id)
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user3, user4, user5, user6, user7
    end

    it "correctly filters on 'is_one_of_folders' predicate" do
      rule = described_class.new('is_one_of_folders', [folder.id])
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user4
    end

    it "correctly filters on 'is_not_folder' predicate" do
      rule = described_class.new('is_not_folder', folder.id)
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user1, user2, user3, user5, user6, user7
    end

    it "correctly filters on 'is_one_of_inputs' predicate" do
      rule = described_class.new('is_one_of_inputs', [idea1.id])
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user4
    end

    it "correctly filters on 'is_not_input' predicate" do
      rule = described_class.new('is_not_input', idea1.id)
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user1, user2, user3, user5, user6, user7
    end

    it "correctly filters on 'is_not_topic' predicate" do
      rule = described_class.new('is_not_topic', topic.id)
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user1, user2, user3, user4, user6, user7
    end

    it "correctly filters on 'is_one_of_topics' predicate" do
      rule = described_class.new('is_one_of_topics', [topic.id])
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user5
    end

    it "correctly filters on 'is_one_of_areas' predicate" do
      rule = described_class.new('is_one_of_areas', [area.id])
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user6
    end

    it "correctly filters on 'is_not_area' predicate" do
      rule = described_class.new('is_not_area', area.id)
      expect { @users = rule.filter(users_scope) }.not_to exceed_query_limit(1)
      expect(@users).to contain_exactly user1, user2, user3, user4, user5, user7
    end
  end

  describe 'description_multiloc' do
    let(:project) do
      create(:project, title_multiloc: {
        'en' => 'My project',
        'fr-FR' => 'Mon projet',
        'nl-NL' => 'Mijn project'
      })
    end
    let(:folder) do
      create(:project_folder, title_multiloc: {
        'en' => 'My folder',
        'fr-FR' => 'Mon dossier',
        'nl-NL' => 'Mijn folder'
      })
    end
    let(:idea1) do
      create(:idea, title_multiloc: {
        'en' => 'My idea',
        'fr-FR' => 'Mon idée',
        'nl-NL' => 'Mijn idee'
      })
    end
    let(:idea2) do
      create(:idea, title_multiloc: {
        'en' => 'Their idea',
        'fr-FR' => 'Leurs idée',
        'nl-NL' => 'Hun idee'
      })
    end
    let(:topic) do
      create(:topic, title_multiloc: {
        'en' => 'My topic',
        'fr-FR' => 'Mon sujet',
        'nl-NL' => 'Mijn onderwerp'
      })
    end
    let(:area) do
      create(:area, title_multiloc: {
        'en' => 'My area',
        'fr-FR' => 'Ma zone',
        'nl-NL' => 'Mijn gebied'
      })
    end

    let(:follow_something) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'something'
      })
    end
    let(:follow_nothing) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'nothing'
      })
    end
    let(:follow_is_one_of_projects) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_one_of_projects',
        'value' => [project.id]
      })
    end
    let(:follow_is_not_project) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_not_project',
        'value' => project.id
      })
    end
    let(:follow_is_one_of_folders) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_one_of_folders',
        'value' => [folder.id]
      })
    end
    let(:follow_is_not_folder) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_not_folder',
        'value' => folder.id
      })
    end
    let(:follow_is_one_of_inputs) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_one_of_inputs',
        'value' => [idea1.id, idea2.id]
      })
    end
    let(:follow_is_not_input) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_not_input',
        'value' => idea2.id
      })
    end
    let(:follow_is_one_of_topics) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_one_of_topics',
        'value' => [topic.id]
      })
    end
    let(:follow_is_not_topic) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_not_topic',
        'value' => topic.id
      })
    end
    let(:follow_is_one_of_areas) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_one_of_areas',
        'value' => [area.id]
      })
    end
    let(:follow_is_not_area) do
      described_class.from_json({
        'ruleType' => 'follow',
        'predicate' => 'is_not_area',
        'value' => area.id
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(follow_something.description_multiloc).to eq({
        'en' => 'Follows something',
        'fr-FR' => 'Suit quelque chose',
        'nl-NL' => 'Volgt iets'
      })
      expect(follow_nothing.description_multiloc).to eq({
        'en' => 'Does not follow anything',
        'fr-FR' => 'Suit rien',
        'nl-NL' => 'Volgt niets'
      })
      expect(follow_is_one_of_projects.description_multiloc).to eq({
        'en' => 'Follows one of the following projects My project',
        'fr-FR' => 'Suit un des projets Mon projet',
        'nl-NL' => 'Volgt één van de volgende projecten Mijn project'
      })
      expect(follow_is_not_project.description_multiloc).to eq({
        'en' => 'Does not follow project My project',
        'fr-FR' => 'Ne suit pas le projet Mon projet',
        'nl-NL' => 'Volgt dit project niet Mijn project'
      })
      expect(follow_is_one_of_folders.description_multiloc).to eq({
        'en' => 'Follows one of the following folders My folder',
        'fr-FR' => 'Suit un des dossiers Mon dossier',
        'nl-NL' => 'Volgt één van deze folders Mijn folder'
      })
      expect(follow_is_not_folder.description_multiloc).to eq({
        'en' => 'Does not follow folder My folder',
        'fr-FR' => 'Ne suit pas le dossier Mon dossier',
        'nl-NL' => 'Volgt deze folder niet Mijn folder'
      })
      expect(follow_is_one_of_inputs.description_multiloc).to eq({
        'en' => 'Follows one of the following inputs My idea, Their idea',
        'fr-FR' => 'Suit un des idées Mon idée, Leurs idée',
        'nl-NL' => 'Volgt één van deze ideeën Mijn idee, Hun idee'
      })
      expect(follow_is_not_input.description_multiloc).to eq({
        'en' => 'Does not follow input Their idea',
        'fr-FR' => "Ne suit pas l'idée Leurs idée",
        'nl-NL' => 'Volgt dit idee niet Hun idee'
      })
      expect(follow_is_one_of_topics.description_multiloc).to eq({
        'en' => 'Follows one of the following topics My topic',
        'fr-FR' => 'Suit une des sujets Mon sujet',
        'nl-NL' => 'Volgt één van deze onderwerpen Mijn onderwerp'
      })
      expect(follow_is_not_topic.description_multiloc).to eq({
        'en' => 'Does not follow topic My topic',
        'fr-FR' => 'Ne suit pas le sujet Mon sujet',
        'nl-NL' => 'Volgt dit onderwerp niet Mijn onderwerp'
      })
      expect(follow_is_one_of_areas.description_multiloc).to eq({
        'en' => 'Follows one of the following areas My area',
        'fr-FR' => 'Suit une des zones Ma zone',
        'nl-NL' => 'Volgt één van deze gebieden Mijn gebied'
      })
      expect(follow_is_not_area.description_multiloc).to eq({
        'en' => 'Does not follow area My area',
        'fr-FR' => 'Ne suit pas la zone Ma zone',
        'nl-NL' => 'Volgt dit gebied niet Mijn gebied'
      })
    end
  end
end
