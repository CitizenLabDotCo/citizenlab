# frozen_string_literal: true

Cl2Back::Application.config.after_initialize do
  Bullet.enable = true
  Bullet.rails_logger = true
  Bullet.bullet_logger = true

  #
  #   OPTIONS
  #
  #   Bullet.sentry = true
  #

  #
  #   Bullet.raise = true # helpful for tests
  #

  #
  #   Bullet.slack = { webhook_url: 'http://some.slack.url', channel: '#default', username: 'notifier' }
  #

  #
  #   Bullet.stacktrace_includes = [ 'your_gem', 'your_middleware' ]
  #   Bullet.stacktrace_excludes = [ 'their_gem', 'their_middleware', ['my_file.rb', 'my_method'], ['my_file.rb', 16..20] ]
  #

  #
  #   Bullet.alert = true
  #   Bullet.console = true
  #   Bullet.growl = true
  #   Bullet.xmpp = { :account  => 'bullets_account@jabber.org',
  #                   :password => 'bullets_password_for_jabber',
  #                   :receiver => 'your_account@jabber.org',
  #                   :show_online_status => true }
  #   Bullet.honeybadger = true
  #   Bullet.bugsnag = true
  #   Bullet.airbrake = true
  #   Bullet.rollbar = true
  #   Bullet.add_footer = true
  #   Bullet.skip_html_injection = false
  #
end
