# ActionCaching

A modern replacement for the unmaintained `actionpack-action_caching` gem, providing action-level HTTP caching for Rails 7.1+ controllers.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'action-caching', path: 'gems/action-caching'
```

## Usage

Include the `ActionCaching::Caching` concern in your controller:

```ruby
class ApplicationController < ActionController::API
  include ActionCaching::Caching

  # Configure the cache store (optional, defaults to Rails.cache)
  self.cache_store = Rails.cache
end
```

Then use the `caches_action` class method to cache specific actions:

```ruby
class ProjectsController < ApplicationController
  # Basic caching with expiration
  caches_action :index, :show, expires_in: 1.minute

  # With custom cache path based on query parameters
  caches_action :search, expires_in: 5.minutes, cache_path: -> { request.query_parameters }

  # With conditional caching
  caches_action :public_data, expires_in: 10.minutes, if: :caching_enabled?

  def index
    @projects = Project.all
    render json: @projects
  end

  private

  def caching_enabled?
    current_user.nil? # Only cache for non-authenticated users
  end
end
```

## Features

- **Drop-in replacement** for `actionpack-action_caching`
- **Rails 7.1+ compatible**
- **ActionController::API support**
- **Flexible cache key generation** via `cache_path` option
- **Conditional caching** via `if`/`unless` options
- **Custom expiration times** via `expires_in` option

## API

### `caches_action(*actions, **options)`

Cache the specified controller actions.

**Parameters:**
- `actions` - List of action names (symbols) to cache
- `options` - Hash of caching options:
  - `expires_in:` - Cache expiration time (e.g., `1.minute`, `1.hour`)
  - `cache_path:` - Proc or symbol for custom cache key generation
  - `if:` - Symbol or proc, only cache when condition is true
  - `unless:` - Symbol or proc, only cache when condition is false

**Examples:**

```ruby
# Cache with expiration
caches_action :show, expires_in: 5.minutes

# Custom cache key including query parameters
caches_action :index, cache_path: -> { request.query_parameters }

# Conditional caching
caches_action :public_list, if: -> { current_user.nil? }
caches_action :admin_panel, unless: :admin_user?
```

## How It Works

The gem uses Rails' `around_action` callbacks to:
1. Check if a cached response exists for the current action
2. If found, render the cached response immediately
3. If not found, execute the action and cache the response

Cache keys are generated based on:
- Controller path
- Action name
- Custom `cache_path` (if provided), or request path + query parameters

## Development

After checking out the repo, run:

```bash
bundle install
bundle exec rspec
```

## License

MIT License - see LICENSE file for details.

## Contributing

This gem is part of the CitizenLab/Go Vocal platform. Contributions are welcome via pull requests.
