require "rails_helper"

describe SmartGroupRules::ParticipatedInIdeaStatus do

  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_idea_status',
    'predicate' => 'in',
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
      @comment = create(:comment, post: @idea1, author: @user3)
      @idea2 = create(:idea, idea_status: @idea_status2, author: @user3)

    end

    it "correctly filters on 'in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('in', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'not_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('not_in', @idea_status2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user4]
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('posted_in', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user1]
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('not_posted_in', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user2, @user3, @user4]
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('commented_in', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user3]
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('not_commented_in', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user4]
    end

    it "correctly filters on 'voted_idea_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('voted_idea_in', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user2]
    end

    it "correctly filters on 'not_voted_idea_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('not_voted_idea_in', @idea_status1.id)
      expect(rule.filter(User)).to match_array [@user1, @user3, @user4]
    end

    it "correctly filters on 'voted_comment_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('voted_comment_in', @idea_status1.id)
      expect(rule.filter(User)).to match_array []
    end

    it "correctly filters on 'not_voted_comment_in' predicate" do
      rule = SmartGroupRules::ParticipatedInIdeaStatus.new('not_voted_comment_in', @idea_status2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3, @user4]
    end

  end

end