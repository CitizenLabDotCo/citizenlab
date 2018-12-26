NLP::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'ideas/:idea_id/similar', action: :index, controller: 'similar_ideas'
    end
  end
end
