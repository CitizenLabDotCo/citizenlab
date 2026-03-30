# frozen_string_literal: true

GVPlugins::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      get 'plugins/front_entries', to: 'plugins#front_entries'
      get 'plugins/:id/front_entry', to: 'plugins#front_entry', as: 'plugin_front_entry'
      match 'plugins/:plugin_name/*path', to: 'plugin_proxy#handle', via: :all
    end
  end
end

Rails.application.routes.draw do
  mount GVPlugins::Engine => ''
end
