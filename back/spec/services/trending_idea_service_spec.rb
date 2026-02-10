# frozen_string_literal: true

require 'rails_helper'

describe TrendingIdeaService do
  before do
    generate_trending_ideas 5
  end

  describe 'filter_trending' do
    it 'filters trending ideas in accordance with the trending criteria (those that have a positive trending score)' do
      trending_filter = nil
      expected_selection = nil
      freeze_time do
        trending_filter = described_class.new.filter_trending(Idea.all).map(&:id)
        expected_selection = Idea.all.select { |i| described_class.new.trending? i }.map(&:id)
      end
      expect(trending_filter.size).to eq expected_selection.size
      expect(trending_filter.sort).to eq expected_selection.sort

      trending_idea = trending_filter.first && Idea.find(trending_filter.first)
      if trending_idea ## updating idea status to rejected should filter the idea out from trending
        trending_idea.idea_status = IdeaStatus.find_by(code: 'rejected') || create(:idea_status, code: 'rejected')
        trending_idea.save
        trending_filter_after = described_class.new.filter_trending(Idea.all).map(&:id)
        expect(trending_filter.size).to eq(trending_filter_after.size + 1)
      end
    end
  end

  describe 'sort_trending' do
    it 'sorts trending to untrending in accordance with the trending score' do
      trending_score_sorted = nil
      expected_order = nil
      freeze_time do
        trending_score_sorted = described_class.new.sort_trending(Idea.all).map(&:id)
        expected_order = Idea.all.sort_by { |i| described_class.new.trending_score i }.map(&:id).reverse
      end

      # lines = []
      # Idea.count.times do |i|
      #   lines.concat [i]
      #   i_got = Idea.find_by(id: trending_score_sorted[i])
      #   i_exp = Idea.find_by(id: expected_order[i])

      #   lines.concat ["ID:        #{trending_score_sorted[i]}       #{expected_order[i]}"]
      #   lines.concat ['--------------------------']
      #   lines.concat ["Score:     #{TrendingIdeaService.new.trending_score i_got}       #{TrendingIdeaService.new.trending_score i_exp}"]
      #   lines.concat ["Trending?: #{TrendingIdeaService.new.trending? i_got}       #{TrendingIdeaService.new.trending? i_exp}"]
      #   lines.concat ['--------------------------']
      #   lines.concat ["Vote diff: #{i_got.score}       #{i_exp.score}"]
      #   lines.concat ["Com cnt:   #{i_got.comments_count}       #{i_exp.comments_count}"]
      #   lines.concat ["Pub_at:    #{i_got.published_at}       #{i_exp.published_at}"]
      #   lines.concat ['--------------------------']
      #   lines.concat ["Last C:    #{Time.at(i_got.comments.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}       #{Time.at(i_exp.comments.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}"]
      #   lines.concat ["Last V:    #{Time.at(i_got.likes.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}       #{Time.at(i_exp.likes.map{|c| c.created_at.to_i}.sort.reverse.first || 0)}"]
      #   lines.concat ['--------------------------']
      #   lines.concat ["Last A:    #{i_got.idea_trending_info.last_activity_at}       #{i_exp.idea_trending_info.last_activity_at}"]
      #   lines.concat ["Mean A:    #{i_got.idea_trending_info.mean_activity_at}       #{i_exp.idea_trending_info.mean_activity_at}"]
      #   lines.concat ['--------------------------']
      #   lines.concat ['--------------------------']
      # end
      # lines.each{|l| puts l}

      expect(trending_score_sorted).to eq expected_order
    end
  end

  def generate_trending_ideas(n)
    n.times do |_i|
      published_at = Faker::Time.between(from: 1.year.ago, to: DateTime.now)
      author = create(:user)
      idea = create(:idea, author: author, published_at: published_at)
      is_popular = (rand(3) == 0)
      (is_popular ? rand(20) : rand(3)).times do |_i|
        create(:reaction, reactable: idea, mode: 'up',
          created_at: Faker::Time.between(from: published_at, to: DateTime.now))
      end
      if rand(2) == 0
        create(:reaction, reactable: idea, mode: 'up',
          user: author,
          created_at: Faker::Time.between(from: published_at, to: DateTime.now))
      end
      (is_popular ? rand(10) : rand(3)).times do |_i|
        create(:reaction, reactable: idea, mode: 'down',
          created_at: Faker::Time.between(from: published_at, to: DateTime.now))
      end
      (is_popular ? rand(10) : rand(3)).times do |_i|
        create(:comment, idea: idea,
          created_at: Faker::Time.between(from: published_at, to: DateTime.now))
      end
    end
  end
end
