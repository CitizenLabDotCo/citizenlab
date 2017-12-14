require "rails_helper"

describe TrendingIdeaService do
  before do
    generate_trending_ideas 3
  end

  describe "filter_trending" do
    it "filters trending ideas in accordance with the trending criterea (those that have a positive trending score)" do
      trending_score_filter = TrendingIdeaService.new.filter_trending(Idea).map(&:id)
      expected_selection = Idea.all.select{ |i| TrendingIdeaService.new.trending? i }.map(&:id)
      expect(trending_score_filter.size).to eq expected_selection.size
      expect(trending_score_filter.sort).to eq expected_selection.sort
    end
  end

  describe "order_trending" do
    it "sorts trending to untrending in accordance with the trending score" do
      trending_score_sorted = TrendingIdeaService.new.sort_trending(Idea).map(&:id)
      expected_order = Idea.all.sort_by{ |i| TrendingIdeaService.new.trending_score i }.map(&:id).reverse
      lines = []
      Idea.count.times do |i|
        lines.concat [i]
        i_got = Idea.find_by(id: trending_score_sorted[i])
        i_exp = Idea.find_by(id: expected_order[i])

        lines.concat ["ID:        #{trending_score_sorted[i]}       #{expected_order[i]}"]
        lines.concat ['--------------------------']
        lines.concat ["Score:     #{TrendingIdeaService.new.trending_score i_got}       #{TrendingIdeaService.new.trending_score i_exp}"]
        lines.concat ["Trending?: #{TrendingIdeaService.new.trending? i_got}       #{TrendingIdeaService.new.trending? i_exp}"]
        lines.concat ['--------------------------']
        lines.concat ["Vote diff: #{i_got.score}       #{i_exp.score}"]
        lines.concat ["Pub_at:    #{i_got.published_at}       #{i_exp.published_at}"]
        lines.concat ['--------------------------']
        lines.concat ["Last C:    #{Time.at(i_got.comments.select{|c| i_got.author && c.author && (c.author.id == i_got.author.id)}.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}       #{Time.at(i_exp.comments.select{|c| i_exp.author && c.author && (c.author.id == i_exp.author.id)}.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}"]
        lines.concat ["Last V:    #{Time.at(i_got.upvotes.select{|v| i_got.author && v.user && (v.user.id == i_got.author.id)}.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}       #{Time.at(i_exp.upvotes.select{|v| i_exp.author && v.user && (v.user.id == i_exp.author.id)}.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}"]
        lines.concat ['--------------------------']
        lines.concat ['--------------------------']
      end
      lines.each{|l| puts l}
      expect(trending_score_sorted).to eq expected_order
    end
  end


  def generate_trending_ideas n
    n.times do |i|
      published_at = Faker::Time.between(1.years.ago, DateTime.now)
      author = create(:user)
      idea = create(:idea, author: author, published_at: published_at)
      is_popular = (rand(3) == 0)
      (if is_popular then rand(100) else rand(3) end).times do |i| 
        create(:vote, votable: idea, mode: 'up',
               created_at: Faker::Time.between(published_at, DateTime.now))
      end
      if (rand(2) == 0)
        create(:vote, votable: idea, mode: 'up', 
               user: author,
               created_at: Faker::Time.between(published_at, DateTime.now))
      end
      (if is_popular then rand(100) else rand(3) end).times do |i| 
        create(:vote, votable: idea, mode: 'down', 
               created_at: Faker::Time.between(published_at, DateTime.now))
      end
      (if is_popular then rand(50) else rand(3) end).times do |i| 
        create(:comment, idea: idea, 
               created_at: Faker::Time.between(published_at, DateTime.now))
      end
    end
  end

end
