require "rails_helper"

describe SmartGroupRules::ParticipatedInTopic do

  let(:valid_json_rule) {{
    'ruleType' => 'participated_in_topic',
    'predicate' => 'in',
    'value' => create(:topic).id
  }}
  let(:valid_rule) { SmartGroupRules::ParticipatedInTopic.from_json(valid_json_rule) }

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
      @topic1 = create(:topic)
      @topic2 = create(:topic)
      @user1 = create(:user)
      @user2 = create(:user)
      @user3 = create(:user)
      @user4 = create(:user)
      @idea1 = create(:idea, topics: [@topic1], author: @user1)
      @comment = create(:comment, post: @idea1, author: @user3)
      @vote = create(:vote, votable: @comment, user: @user2)
      @idea2 = create(:idea, topics: [@topic2], author: @user3)
    end

    it "correctly filters on 'in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3]
    end

    it "correctly filters on 'not_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('not_in', @topic2.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user4]
    end

    it "correctly filters on 'posted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('posted_in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user1]
    end

    it "correctly filters on 'not_posted_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('not_posted_in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user2, @user3, @user4]
    end

    it "correctly filters on 'commented_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('commented_in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user3]
    end

    it "correctly filters on 'not_commented_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('not_commented_in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user4]
    end

    it "correctly filters on 'voted_idea_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('voted_idea_in', @topic1.id)
      expect(rule.filter(User)).to match_array []
    end

    it "correctly filters on 'not_voted_idea_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('not_voted_idea_in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user1, @user2, @user3, @user4]
    end

    it "correctly filters on 'voted_comment_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('voted_comment_in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user2]
    end

    it "correctly filters on 'not_voted_comment_in' predicate" do
      rule = SmartGroupRules::ParticipatedInTopic.new('not_voted_comment_in', @topic1.id)
      expect(rule.filter(User)).to match_array [@user1, @user3, @user4]
    end

  end

end