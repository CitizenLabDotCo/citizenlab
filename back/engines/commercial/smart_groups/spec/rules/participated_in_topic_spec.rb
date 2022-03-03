require "rails_helper"

describe SmartGroups::Rules::ParticipatedInTopic do
  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_topic',
    'predicate' => 'in',
    'value' => create_list(:topic, 2).map(&:id)
  }}
  let(:valid_rule) { SmartGroups::Rules::ParticipatedInTopic.from_json(valid_json_rule) }

  describe "from_json" do
    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end
  end

  describe "validations" do
    it "accepts a rule with a mutli-value predicate and an array of values" do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it "rejects a rule with a mutli-value predicate and a single value" do
      rule = valid_json_rule.tap{|r| r['predicate']='in'; r['value']=Topic.first.id}
      expect(build(:smart_group, rules: [rule])).to be_invalid
    end

    it "accepts a rule with a single-value predicate and a single value" do
      rule = valid_json_rule.tap{|r| r['predicate']='not_in'; r['value']=Topic.first.id}
      expect(SmartGroups::Rules::ParticipatedInTopic.from_json(rule)).to be_valid
      expect(build(:smart_group, rules: [rule])).to be_valid
    end

    it "rejects a rule with a single-value predicate and an array of values" do
      rule = valid_json_rule.tap{|r| r['predicate']='not_in'}
      expect(build(:smart_group, rules: [valid_json_rule])).to be_invalid
    end
  end

  describe "filter" do
    before do
      @topic1 = create(:topic)
      @topic2 = create(:topic)
      @project = create(:project, allowed_input_topics: [@topic1, @topic2])
      @user1 = create(:user)
      @user2 = create(:user)
      @user3 = create(:user)
      @user4 = create(:user)
      @idea1 = create(:idea, topics: [@topic1], author: @user1, project: @project)
      @comment = create(:comment, post: @idea1, author: @user3)
      @vote = create(:vote, votable: @comment, user: @user2)
      @idea2 = create(:idea, topics: [@topic2], author: @user3, project: @project)
    end

    it "correctly filters on 'in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('in', [@topic1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array([@user1.id, @user2.id, @user3.id])
    end

    it "correctly filters on 'not_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('not_in', @topic2.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user4.id]
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('posted_in', [@topic1.id, @topic2.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user3.id]
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('not_posted_in', @topic1.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user2.id, @user3.id, @user4.id]
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('commented_in', [@topic1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user3.id]
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('not_commented_in', @topic1.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user4.id]
    end

    it "correctly filters on 'voted_idea_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('voted_idea_in', [@topic1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array []
    end

    it "correctly filters on 'not_voted_idea_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('not_voted_idea_in', @topic1.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user2.id, @user3.id, @user4.id]
    end

    it "correctly filters on 'voted_comment_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('voted_comment_in', [@topic1.id])
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user2.id]
    end

    it "correctly filters on 'not_voted_comment_in' predicate" do
      rule = SmartGroups::Rules::ParticipatedInTopic.new('not_voted_comment_in', @topic1.id)
      expect{ @ids = rule.filter(User).ids }.not_to exceed_query_limit(1)
      expect(@ids).to match_array [@user1.id, @user3.id, @user4.id]
    end
  end

  describe "description_multiloc" do
    let(:topic1) { create(:topic, title_multiloc: {
      'en'    => 'beer',
      'fr-FR' => 'bière',
      'nl-NL' => 'bier'
    }) }
    let(:topic2) { create(:topic, title_multiloc: {
      'en'    => 'delayed',
      'fr-FR' => 'retardé',
      'nl-NL' => 'uitgesteld'
    }) }

    let(:participated_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'in',
      'value'         => [topic1.id, topic2.id]
    })}
    let(:participated_not_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'not_in',
      'value'         => topic1.id
    })}
    let(:participated_posted_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'posted_in',
      'value'         => [topic1.id]
    })}
    let(:participated_not_posted_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'not_posted_in',
      'value'         => topic1.id
    })}
    let(:participated_commented_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'commented_in',
      'value'         => [topic1.id, topic2.id]
    })}
    let(:participated_not_commented_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'not_commented_in',
      'value'         => topic1.id
    })}
    let(:participated_voted_idea_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'voted_idea_in',
      'value'         => [topic1.id]
    })}
    let(:participated_not_voted_idea_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'not_voted_idea_in',
      'value'         => topic1.id
    })}
    let(:participated_voted_comment_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'voted_comment_in',
      'value'         => [topic1.id, topic2.id]
    })}
    let(:participated_not_voted_comment_in_topic_in_rule) {SmartGroups::Rules::ParticipatedInTopic.from_json({
      'ruleType'      => 'participated_in_topic',
      'predicate'     => 'not_voted_comment_in',
      'value'         => topic1.id
    })}

    it "successfully translates different combinations of rules" do
      expect(participated_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Participation in an idea with one of the following topics beer, delayed',
        'fr-FR' => 'Participation dans une idée avec thème est un de bière, retardé',
        'nl-NL' => 'Participatie in een idee met één van de volgende thema bier, uitgesteld'
      })
      expect(participated_not_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'No participation in an idea with topic beer',
        'fr-FR' => 'Pas de participation dans une idée avec thème bière',
        'nl-NL' => 'Geen participatie in een idee met thema bier'
      })
      expect(participated_posted_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Posted an idea with one of the following topics beer',
        'fr-FR' => 'Posté une idée avec thème est un de bière',
        'nl-NL' => 'Plaatste een idee met één van de volgende thema bier'
      })
      expect(participated_not_posted_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not post an idea with topic beer',
        'fr-FR' => 'N\'as pas posté une idée avec thème bière',
        'nl-NL' => 'Plaatste geen idee met thema bier'
      })
      expect(participated_commented_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Commented on an idea with one of the following topics beer, delayed',
        'fr-FR' => 'Commenté sur une idée avec thème est un de bière, retardé',
        'nl-NL' => 'Reageerde op een idee met één van de volgende thema bier, uitgesteld'
      })
      expect(participated_not_commented_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not comment on an idea with topic beer',
        'fr-FR' => 'N\'as pas commenté sur une idée avec thème bière',
        'nl-NL' => 'Reageerde niet op een idee met thema bier'
      })
      expect(participated_voted_idea_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Voted on an idea with one of the following topics beer',
        'fr-FR' => 'Voté pour une idée avec thème est un de bière',
        'nl-NL' => 'Stemde op een idee met één van de volgende thema bier'
      })
      expect(participated_not_voted_idea_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not vote on an idea with topic beer',
        'fr-FR' => 'N\'as pas voté pour une idée avec thème bière',
        'nl-NL' => 'Stemde niet op een idee met thema bier'
      })
      expect(participated_voted_comment_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Voted on a comment on an idea with one of the following topics beer, delayed',
        'fr-FR' => 'Voté pour un commentaire sur une idée avec thème est un de bière, retardé',
        'nl-NL' => 'Stemde op een reactie op een idee met één van de volgende thema bier, uitgesteld'
      })
      expect(participated_not_voted_comment_in_topic_in_rule.description_multiloc).to eq ({
        'en'    => 'Did not vote on a comment on an idea with topic beer',
        'fr-FR' => 'N\'as pas voté pour un commentaire sur une idée avec thème bière',
        'nl-NL' => 'Stemde niet op een reactie op een idee met thema bier'
      })
    end
  end

end
