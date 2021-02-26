NLP::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'ideas/:idea_id/similar', action: :index, controller: 'similar_ideas'
      get 'ideas/geotagged', action: :index, controller: 'geotagged_ideas'
      get 'tag_suggestions', action: :index, controller: 'tag_suggestions'
    end
  end
end
