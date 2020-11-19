NLP::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'ideas/:idea_id/similar', action: :index, controller: 'similar_ideas'
      get 'ideas/geotagged', action: :index, controller: 'geotagged_ideas'
      resources :tags, only: %i[index show]
      get 'tag_suggestions', action: :generate_tags, controller: 'tags'
      get 'tag_assignments/automatic', action: :index_automatic, controller: 'tag_assignments'
      get 'generate_tag_assignment', action: :generate_tag_assignments, controller: 'tag_assignments'
    end
  end
end
