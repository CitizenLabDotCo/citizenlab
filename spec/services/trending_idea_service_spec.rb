require "rails_helper"

describe TrendingIdeaService do
  before do
    generate_trending_ideas 20
  end

  describe "order_trending" do
    it "sorts trending to untrending in accordance with the trending score" do
      trending_score_sorted = TrendingIdeaService.new.sort_trending(Idea).map(&:id)
      expect(trending_score_sorted).to eq Idea.all.sort_by(&:trending_score).map(&:id).reverse 
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
    end
  end

end
