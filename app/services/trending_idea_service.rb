class TrendingIdeaService
  # Care should be taken whilst using this service
  # as some shared state is kept for efficient use
  # of the service's methods.

  TREND_NUM_UPVOTES = 5
  TREND_NUM_COMMENTS = 5
  TREND_SINCE_ACTIVITY = 100 * 24 * 60 * 60 # 100 days

  def initialize
    @upvotes_ago = nil
    @comments_ago = nil
  end


  def filter_trending ideas=Idea.all
    cache_state(ideas) if !(@upvotes_ago && @comments_ago)
  end

  def sort_trending ideas=Idea.all
    cache_state(ideas) if !(@upvotes_ago && @comments_ago)
  end


  private

  def cache_state ideas
    @upvotes_ago = {}
    @comments_ago = {}
    ideas.each do |i|
      default_ago = Time.now.to_i - i.published_at.to_i
      @upvotes_ago[i.id] = activity_ago upvotes.select { |v| i.author && v.user && (v.user.id == i.author.id) }, 
                                        TREND_NUM_UPVOTES, default_ago
      @comments_ago[i.id] = activity_ago comments.select { |c| i.author && c.author && (c.author.id == i.author.id) }, 
                                         TREND_NUM_COMMENTS, default_ago
    end
  end

  def activity_ago iteratables, default_ago, n
    take_and_fill iteratables.map{ |obj| Time.now.to_i - obj.created_at.to_i }.sort,
                  n, 
                  default_ago
  end

  def take_and_fill arr, n, default
    taken = arr.take n
    fill = Array.new (n - taken.size), default
    taken.concat fill
  end


  def trending? idea
    !(((idea.upvotes_count - idea.downvotes_count) < 0) || 
      (idea.idea_status.code == 'rejected') || 
      ([upvotes_ago.first, comments_ago.first].min > TREND_SINCE_ACTIVITY))
  end






def trending_score
    upvotes_ago = activity_ago upvotes.select { |v| author && v.user && (v.user.id == author.id) }
    comments_ago = activity_ago comments.select { |c| author && c.author && (c.author.id == author.id) }
    score = trending_score_formula (upvotes_count - downvotes_count), upvotes_ago, comments_ago
    if (upvotes_count - downvotes_count) < 0
      return -1 / score
    end
    if idea_status.code == 'rejected'
      return -1 / score
    end
    if [upvotes_ago.first, comments_ago.first].min > TREND_SINCE_ACTIVITY
      return -1 / score
    end
    score
  end

  def trending? score=trending_score
    trending_score >= 0
  end

  def trending_score_formula votes_diff, upvotes_ago, comments_ago
    [(1 + votes_diff), 1].max / (mean(upvotes_ago) + mean(comments_ago))
  end

  

  def mean arr
    if arr.size == 0
      0
    else
      arr.inject{ |sum, el| sum + el }.to_f / arr.size
    end
  end





  def home_url tenant=Tenant.current
    tenant.base_frontend_uri
  end

  def model_to_url model_instance, tenant=Tenant.current
    subroute = nil
    slug = nil
    if model_instance.kind_of? Project
      subroute = 'projects'
      slug = model_instance.slug
    elsif model_instance.kind_of? Idea
      subroute = 'ideas'
      slug = model_instance.slug
    elsif model_instance.kind_of? Comment ### comments do not have a URL yet, we return the idea URL for now
      subroute = 'ideas'
      slug = model_instance.idea.slug
    elsif model_instance.kind_of? Page
      subroute = 'pages'
      slug = model_instance.slug
    end

    subroute && slug && "#{tenant.base_frontend_uri}/#{subroute}/#{slug}"
  end

  def signon_success_url tenant=Tenant.current
    "#{tenant.base_frontend_uri}/complete-signup"
  end

  def signon_failure_url tenant=Tenant.current
    "#{tenant.base_frontend_uri}/authentication-error"
  end

end