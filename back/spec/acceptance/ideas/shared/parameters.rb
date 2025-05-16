# frozen_string_literal: true

module SharedParameters
  def define_filter_params(scope: nil)
    options = { scope: scope }.compact

    sort_options = %w[
      new -new trending -trending popular -popular author_name -author_name likes_count
      -likes_count dislikes_coun -dislikes_count status -status baskets_count
      -baskets_count votes_count -votes_count budget -budget random
    ]

    with_options(options) do
      parameter :topics, 'Filter by topics (OR)'
      parameter :projects, 'Filter by projects (OR)'
      parameter :phase, 'Filter by project phase'
      parameter :basket_id, 'Filter by basket'
      parameter :author, 'Filter by author (user id)'
      parameter :idea_status, 'Filter by status (idea status id)'
      parameter :search, 'Filter by searching in title and body'
      parameter :sort, "Either #{sort_options.join(', ')}"
      parameter :publication_status, 'Filter by publication status; returns all published ideas by default'
      parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}"
      parameter :feedback_needed, 'Filter out ideas that need feedback'
      parameter :filter_trending, 'Filter out truly trending ideas'
    end
  end
end
