Seo::Engine.routes.draw do
  scope module: 'seo' do
    get 'sitemap', to: 'application#sitemap', defaults: { format: :xml }
    get 'robots', to: 'application#sitemap', defaults: { format: :txt }
    get 'okcomputer', to: proc { [200, {}, ['']] }
  end
end
