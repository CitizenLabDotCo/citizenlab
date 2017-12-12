require 'rails_helper'

RSpec.describe Idea, type: :model do
  context "associations" do
    it { should have_many(:votes) }
  end

  context "Default factory" do
    it "is valid" do
      expect(build(:idea)).to be_valid
    end
  end

  context "hooks" do
    it "should set the author name on creation" do
      u = create(:user)
      idea = create(:idea, author: u)
      expect(idea.author_name).to eq u.display_name
    end

    it "should generate a slug on creation" do
      idea = create(:idea, slug: nil)
      expect(idea.slug).to be_present
    end

  end

  context "published at" do
    it "gets set immediately when creating a published idea" do
      t = Time.now
      travel_to t do
        idea = create(:idea, publication_status: 'published')
        expect(idea.published_at.to_i).to eq t.to_i
      end
    end

    it "stays empty when creating a draft" do
      idea = create(:idea, publication_status: 'draft')
      expect(idea.published_at).to be_nil
    end

    it "gets filled in when publishing a draft" do
      idea = create(:idea, publication_status: 'draft')
      t = Time.now + 1.week
      travel_to t do
        idea.update(publication_status: 'published')
        expect(idea.published_at.to_i).to eq t.to_i
      end
    end

    it "doesn't change again when already published once" do
      t = Time.now
      travel_to t
      idea = create(:idea, publication_status: 'published')
      travel_to t+1.week
      idea.update(publication_status: 'closed')
      travel_to t+1.week
      idea.update(publication_status: 'published')
      expect(idea.published_at.to_i).to eq t.to_i
      travel_back
    end
  end

  context "idea_status" do

    it "gets set to proposed on creation when not set" do
      create(:idea_status, code: 'proposed')
      idea = create(:idea, idea_status: nil)
      expect(idea.idea_status_id).to eq IdeaStatus.find_by(code: 'proposed').id
    end
  end

  describe "order_new" do
    before do
      5.times do |i|
        travel_to Time.now+i.week do 
          create(:idea)
        end
      end
    end

    it "sorts from new to old by default" do
      time_serie = Idea.order_new.pluck(:published_at)
      expect(time_serie).to eq time_serie.sort.reverse
    end

    it "sorts from new to old when asking desc" do
      time_serie = Idea.order_new(:desc).pluck(:published_at)
      expect(time_serie).to eq time_serie.sort.reverse
    end

    it "sorts from old to new when asking asc" do
      time_serie = Idea.order_new(:asc).pluck(:published_at)
      expect(time_serie).to eq time_serie.sort      
    end
  end

  describe "order_popular" do
    before do
      5.times do |i|
        idea = create(:idea)
        rand(20).times{create(:vote, votable: idea, mode: ['up','down'][rand(1)])}
      end
    end

    it "sorts from popular to unpopular by default" do
      score_serie = Idea.order_popular.map(&:score)
      expect(score_serie).to eq score_serie.sort.reverse
    end

    it "sorts from popular to unpopular when asking desc" do
      score_serie = Idea.order_popular(:desc).map(&:score)
      expect(score_serie).to eq score_serie.sort.reverse
    end

    it "sorts from unpopular to popular when asking asc" do
      score_serie = Idea.order_popular(:asc).map(&:score)
      expect(score_serie).to eq score_serie.sort      
    end
  end

  describe "order_trending" do

    it "favours ideas with more upvotes and fewer downvotes" do
      [{up: 10, down: 3}, {up: 10, down: 3}, {up: 7, down: 5}, {up: 1, down: 10}].each do |v_hash|
        idea = create(:idea, published_at: Time.now-7.day)
        v_hash[:up].times{create(:vote, votable: idea, mode: 'up')}
        v_hash[:down].times{create(:vote, votable: idea, mode: 'down')}
      end
      expect(Idea.all.sort_by(&:trending_score).map(&:id)
                 .reverse).to eq Idea.all.sort_by{|i| i.upvotes_count - i.downvotes_count}
                                     .map(&:id).reverse 
    end

    it "favours more recent ideas" do
      5.times do |i|
        travel_to(Time.now-7.day + i.day) do 
          idea = create(:idea)
          4.times{create(:vote, votable: idea, mode: 'up')}
          2.times{create(:comment, idea: idea)}
        end
      end
      expect(Idea.all.sort_by(&:trending_score).map(&:id)
                 .reverse).to eq Idea.all.sort_by(&:published_at)
                                     .map(&:id).reverse 
    end

    #it "sorts from trending to untrending by default" do
    #  trending_score_sorted = TrendingIdeaService.new.sort_trending(Idea).map(&:id)
    #  expect(trending_score_sorted).to eq Idea.all.sort_by(&:trending_score).map(&:id).reverse
    #end

    #it "sorts from trending to untrending when asking desc" do
    #  trending_score_sorted = TrendingIdeaService.new.sort_trending(Idea).map(&:id).reverse
    #  expect(trending_score_sorted).to eq Idea.all.sort_by(&:trending_score).map(&:id).reverse
    #end

    it "sorts from untrending to trending when asking asc" do
      5.times do |i|
        travel_to(Time.now-7.day + i.day) do 
          idea = create(:idea)
          rand(20).times{create(:vote, votable: idea, mode: ['up','down'][rand(1)])}
        end
      end
      trending_score_sorted = TrendingIdeaService.new.sort_trending(Idea).map(&:id)
      expect(trending_score_sorted).to eq Idea.all.sort_by(&:trending_score).map(&:id).reverse 
    end
  end

  describe "order_status" do
    it "sorts from high status to low status when asked desc" do
      status_sorted = Idea.order_status(:desc).map(&:id)
      expect(status_sorted).to eq Idea.all.sort_by{|idea| idea.idea_status.ordering}.map(&:id).reverse
    end
  end


end
