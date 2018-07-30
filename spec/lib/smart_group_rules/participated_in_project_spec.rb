require "rails_helper"

describe SmartGroupRules::ParticipatedInProject do

  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_project',
    'predicate' => 'is',
    'value' => create(:project).id
  }}
  let(:valid_rule) { SmartGroupRules::ParticipatedInProject.from_json(valid_json_rule) }

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
      @project1 = create(:project)
      @project2 = create(:project)
      @user1 = create(:user)
      @user2 = create(:user)
      @user3 = create(:user)
      @idea1 = create(:idea, project: @project1, author: @user1)
      @vote = create(:vote, votable: @idea1, user: @user2)
      @comment = create(:comment, idea: @idea1, author: @user3)
      @idea2 = create(:idea, project: @project2, author: @user3)

    end

    it "correctly filters on 'is' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('is', @project1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'not_is' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('not_is', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2]
    end

  end

end