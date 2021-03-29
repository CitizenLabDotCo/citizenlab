require "rails_helper"

describe SmartGroups::Rules::ParticipatedInProject do

  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_project',
    'predicate' => 'in',
    'value' => create(:project).id
  }}
  let(:valid_rule) { SmartGroups::Rules::ParticipatedInProject.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end
  end

  describe "filter" do

    before do
      @project1 = create(:project)
      @project2 = create(:project)
      @user1 = create(:user)
      @user2 = create(:user)
      @user3 = create(:user)
      @idea1 = create(:idea, project: @project1, author: @user1)
      @vote = create(:vote, votable: @idea1, user: @user2)
      @comment = create(:comment, post: @idea1, author: @user3)
      @idea2 = create(:idea, project: @project2, author: @user3)

    end

    it "correctly filters on 'in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'not_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('not_in', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2]
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('posted_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1]
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('not_posted_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user2, @user3]
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('commented_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user3]
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('not_commented_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2]
    end

    it "correctly filters on 'voted_idea_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('voted_idea_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user2]
    end

    it "correctly filters on 'not_voted_idea_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('not_voted_idea_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1, @user3]
    end

    it "correctly filters on 'voted_comment_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('voted_comment_in', @project1.id)
      expect(rule.filter(User)).to match_array []
    end

    it "correctly filters on 'not_voted_comment_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('not_voted_comment_in', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'budgeted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('budgeted_in', @project1.id)
      expect(rule.filter(User)).to match_array []
    end

    it "correctly filters on 'not_budgeted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('not_budgeted_in', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'volunteered_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('volunteered_in', @project1.id)
      expect(rule.filter(User)).to match_array []
    end

    it "correctly filters on 'not_volunteered_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInProject.new('not_volunteered_in', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end
  end

  describe "description_multiloc" do
    let(:project) { create(:project, title_multiloc: {
      'en'    => 'Choose a name for the new trash can',
      'fr-FR' => 'Choisissez un nom pour la nouvelle poubelle',
      'nl-NL' => 'Kies een naam voor de nieuwe vuilnisbak'
    }) }

    let(:participated_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'in',
      'value'         => project.id
    })}
    let(:participated_not_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'not_in',
      'value'         => project.id
    })}
    let(:participated_posted_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'posted_in',
      'value'         => project.id
    })}
    let(:participated_not_posted_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'not_posted_in',
      'value'         => project.id
    })}
    let(:participated_commented_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'commented_in',
      'value'         => project.id
    })}
    let(:participated_not_commented_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'not_commented_in',
      'value'         => project.id
    })}
    let(:participated_voted_idea_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'voted_idea_in',
      'value'         => project.id
    })}
    let(:participated_not_voted_idea_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'not_voted_idea_in',
      'value'         => project.id
    })}
    let(:participated_voted_comment_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'voted_comment_in',
      'value'         => project.id
    })}
    let(:participated_not_voted_comment_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'not_voted_comment_in',
      'value'         => project.id
    })}
    let(:participated_budgeted_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'budgeted_in',
      'value'         => project.id
    })}
    let(:participated_not_budgeted_in_project_in_rule) {SmartGroups::Rules::ParticipatedInProject.from_json({
      'ruleType'      => 'participated_in_project',
      'predicate'     => 'not_budgeted_in',
      'value'         => project.id
    })}


    it "successfully translates different combinations of rules" do
      # Stubbing the translations so the specs don't depend on those.
      I18n.load_path += Dir[Rails.root.join('spec', 'fixtures', 'locales', '*.yml')]

      expect(participated_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Participation in an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'Participation dans une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Participatie in een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_not_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'No participation in an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'Pas de participation dans une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Geen participatie in een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_posted_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Posted an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'Posté une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Plaatste een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_not_posted_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not post an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'N\'as pas posté une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Plaatste geen idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_commented_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Commented on an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'Commenté sur une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Reageerde op een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_not_commented_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not comment on an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'N\'as pas commenté sur une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Reageerde niet op een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_voted_idea_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Voted on an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'Voté pour une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Stemde op een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_not_voted_idea_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not vote on an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'N\'as pas voté pour une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Stemde niet op een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_voted_comment_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Voted on a comment on an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'Voté pour un commentaire sur une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Stemde op een reactie op een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_not_voted_comment_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not vote on a comment on an idea in the project Choose a name for the new trash can',
        'fr-FR' => 'N\'as pas voté pour un commentaire sur une idée dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Stemde niet op een reactie op een idee in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_budgeted_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Assigned a budget in the project Choose a name for the new trash can',
        'fr-FR' => 'Dépensé un budget dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Wees een budget toe in het project Kies een naam voor de nieuwe vuilnisbak'
      })
      expect(participated_not_budgeted_in_project_in_rule.description_multiloc).to eq ({
        'en'    => 'Didn\'t assign a budget in the project Choose a name for the new trash can',
        'fr-FR' => 'N\'as pas dépensé un budget dans le projet Choisissez un nom pour la nouvelle poubelle',
        'nl-NL' => 'Wees geen budget toe in het project Kies een naam voor de nieuwe vuilnisbak'
      })
    end
  end

end
