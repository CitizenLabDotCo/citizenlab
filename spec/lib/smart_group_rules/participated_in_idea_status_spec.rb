require "rails_helper"

describe SmartGroupRules::ParticipatedInIdeaStatus do

  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_idea_status',
    'predicate' => 'is',
    'value' => create(:idea_status).id
  }}
  let(:valid_rule) { SmartGroupRules::ParticipatedInIdeaStatus.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
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
      @comment = create(:comment, idea: @idea1, author: @user3)
      @idea2 = create(:idea, idea_status: @idea_status2, author: @user3)

    end

    it "correctly filters on 'is' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('is', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'not_is' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('not_is', @idea_status2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user4]
    end

  end

end