NLP::Engine.routes.draw do
  namespace :web_api, :defaults => {:format => :json} do
    namespace :v1 do
      get 'ideas/:idea_id/similar', action: :index, controller: 'similar_ideas'
      get 'tag_suggestions', action: :index, controller: 'tag_suggestions'
      # get 'sentiment', action: :test, controller: 'sentiment_analysis'
      get 'ideas/:idea_id/sentiment/', action: :by_idea, controller: 'sentiment_analysis'
      get 'comments/:comment_id/sentiment/', action: :by_comment, controller: 'sentiment_analysis'
      
    end
  end
end

Rails.application.routes.draw do
  mount NLP::Engine => '', as: 'nlp'
end