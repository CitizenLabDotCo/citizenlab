require "rails_helper"

describe SmartGroupRules::ParticipatedInProject do

  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_project',
    'predicate' => 'in',
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
      @comment = create(:comment, post: @idea1, author: @user3)
      @idea2 = create(:idea, project: @project2, author: @user3)

    end

    it "correctly filters on 'in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'not_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('not_in', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2]
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('posted_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1]
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('not_posted_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user2, @user3]
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('commented_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user3]
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('not_commented_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2]
    end

    it "correctly filters on 'voted_idea_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('voted_idea_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user2]
    end

    it "correctly filters on 'not_voted_idea_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('not_voted_idea_in', @project1.id)
      expect(rule.filter(User)).to match_array [@user1, @user3]
    end

    it "correctly filters on 'voted_comment_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('voted_comment_in', @project1.id)
      expect(rule.filter(User)).to match_array []
    end

    it "correctly filters on 'not_voted_comment_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('not_voted_comment_in', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'budgeted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('budgeted_in', @project1.id)
      expect(rule.filter(User)).to match_array []
    end

    it "correctly filters on 'not_budgeted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInProject.new('not_budgeted_in', @project2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

  end

end