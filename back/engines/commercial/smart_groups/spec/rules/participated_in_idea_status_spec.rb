require "rails_helper"

describe SmartGroups::Rules::ParticipatedInIdeaStatus do

  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_idea_status',
    'predicate' => 'in',
    'value' => create_list(:idea_status, 2).map(&:id)
  }}
  let(:valid_rule) { SmartGroups::Rules::ParticipatedInIdeaStatus.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end

  end

  describe "validations" do
    it "accept a rule with a mutli-value predicate and an array of values" do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it "reject a rule with a mutli-value predicate and a single value" do
      rule = valid_json_rule.tap{|r| r['predicate']='in'; r['value']=IdeaStatus.first.id}
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end

    it "accepts a rule with a single-value predicate and a single value" do
      rule = valid_json_rule.tap{|r| r['predicate']='not_in'; r['value']=IdeaStatus.first.id}
      expect(SmartGroups::Rules::ParticipatedInIdeaStatus.from_json(rule)).to be_valid
      expect(build(:smart_group, rules: [rule])).to be_valid
    end

    it "reject a rule with a single-value predicate and an array of values" do
      rule = valid_json_rule.tap{|r| r['predicate']='not_in'}
      expect(build(:smart_group, rules: [valid_json_rule])).to be_invalid
    end
  end

  describe "filter" do

    before do
      @idea_status1 = create(:idea_status)
      @idea_status2 = create(:idea_status)
      @user1 = create(:user)
      @user2 = create(:user)
      @user3 = create(:user)
      @user4 = create(:user)
      @idea1 = create(:idea, idea_status: @idea_status1, author: @user1)
      @vote = create(:vote, votable: @idea1, user: @user2)
      @comment = create(:comment, post: @idea1, author: @user3)
      @idea2 = create(:idea, idea_status: @idea_status2, author: @user3)

    end

    it "correctly filters on 'in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('in', [@idea_status1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user3.id]
    end

    it "correctly filters on 'not_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('not_in', @idea_status2.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user4.id]
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('posted_in', [@idea_status1.id, @idea_status2.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user3.id]
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('not_posted_in', @idea_status1.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user2.id, @user3.id, @user4.id]
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('commented_in', [@idea_status1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user3.id]
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('not_commented_in', @idea_status1.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user4.id]
    end

    it "correctly filters on 'voted_idea_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('voted_idea_in', [@idea_status1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user2.id]
    end

    it "correctly filters on 'not_voted_idea_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('not_voted_idea_in', @idea_status1.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user3.id, @user4.id]
    end

    it "correctly filters on 'voted_comment_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('voted_comment_in', [@idea_status1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array []
    end

    it "correctly filters on 'not_voted_comment_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInIdeaStatus.new('not_voted_comment_in', @idea_status2.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user3.id, @user4.id]
    end

  end

  describe "description_multiloc" do
    let(:garbage_status) { create(:idea_status, title_multiloc: {
      'en'    => 'in the garbage can',
      'fr-FR' => 'dans la poubelle',
      'nl-NL' => 'in de prullenmand'
    }) }
    let(:delayed_status) { create(:idea_status, title_multiloc: {
      'en'    => 'delayed',
      'fr-FR' => 'retardé',
      'nl-NL' => 'uitgesteld'
    }) }

    let(:participated_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'in',
      'value'         => [garbage_status.id, delayed_status.id]
    })}
    let(:participated_not_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'not_in',
      'value'         => garbage_status.id
    })}
    let(:participated_posted_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'posted_in',
      'value'         => [garbage_status.id]
    })}
    let(:participated_not_posted_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'not_posted_in',
      'value'         => garbage_status.id
    })}
    let(:participated_commented_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'commented_in',
      'value'         => [garbage_status.id, delayed_status.id]
    })}
    let(:participated_not_commented_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'not_commented_in',
      'value'         => garbage_status.id
    })}
    let(:participated_voted_idea_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'voted_idea_in',
      'value'         => [garbage_status.id]
    })}
    let(:participated_not_voted_idea_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'not_voted_idea_in',
      'value'         => garbage_status.id
    })}
    let(:participated_voted_comment_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'voted_comment_in',
      'value'         => [garbage_status.id, delayed_status.id]
    })}
    let(:participated_not_voted_comment_in_idea_status_in_rule) {SmartGroups::Rules::ParticipatedInIdeaStatus.from_json({
      'ruleType'      => 'participated_in_idea_status',
      'predicate'     => 'not_voted_comment_in',
      'value'         => garbage_status.id
    })}

    it "successfully translates different combinations of rules" do
      expect(participated_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Participation in an idea with one of the following statuses in the garbage can, delayed',
        'fr-FR' => 'Participation dans une idée avec statut est un de dans la poubelle, retardé',
        'nl-NL' => 'Participatie in een idee met één van de volgende statussen in de prullenmand, uitgesteld'
      })
      expect(participated_not_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'No participation in an idea with status in the garbage can',
        'fr-FR' => 'Pas de participation dans une idée avec statut dans la poubelle',
        'nl-NL' => 'Geen participatie in een idea met status in de prullenmand'
      })
      expect(participated_posted_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Posted an idea with one of the following statuses in the garbage can',
        'fr-FR' => 'Posté une idée avec statut est un de dans la poubelle',
        'nl-NL' => 'Plaatste een idee met één van de volgende statussen in de prullenmand'
      })
      expect(participated_not_posted_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not post an idea with status in the garbage can',
        'fr-FR' => 'N\'as pas posté une idée avec statut dans la poubelle',
        'nl-NL' => 'Plaatste geen idee met status in de prullenmand'
      })
      expect(participated_commented_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Commented on an idea with one of the following statuses in the garbage can, delayed',
        'fr-FR' => 'Commenté sur une idée avec statut est un de dans la poubelle, retardé',
        'nl-NL' => 'Reageerde op een idee met één van de volgende statussen in de prullenmand, uitgesteld'
      })
      expect(participated_not_commented_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not comment on an idea with status in the garbage can',
        'fr-FR' => 'N\'as pas commenté sur une idée avec statut dans la poubelle',
        'nl-NL' => 'Reageerde niet op een idee met status in de prullenmand'
      })
      expect(participated_voted_idea_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Voted on an idea with one of the following statuses in the garbage can',
        'fr-FR' => 'Voté pour une idée avec statut est un de dans la poubelle',
        'nl-NL' => 'Stemde op een idee met één van de volgende statussen in de prullenmand'
      })
      expect(participated_not_voted_idea_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not vote on an idea with status in the garbage can',
        'fr-FR' => 'N\'as pas voté pour une idée avec statut dans la poubelle',
        'nl-NL' => 'Stemde niet op een idee met status in de prullenmand'
      })
      expect(participated_voted_comment_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Voted on a comment on an idea with one of the following statuses in the garbage can, delayed',
        'fr-FR' => 'Voté pour un commentaire sur une idée avec statut est un de dans la poubelle, retardé',
        'nl-NL' => 'Stemde op een reactie op een idee met één van de volgende statussen in de prullenmand, uitgesteld'
      })
      expect(participated_not_voted_comment_in_idea_status_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not vote on a comment on an idea with status in the garbage can',
        'fr-FR' => 'N\'as pas voté pour un commentaire sur une idée avec statut dans la poubelle',
        'nl-NL' => 'Stemde niet op een reactie op een idee met status in de prullenmand'
      })
    end
  end

end
