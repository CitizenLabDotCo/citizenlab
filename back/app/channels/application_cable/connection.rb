module ApplicationCable
  class Connection < ActionCable::Connection::Base
    # TODO: Solve multi-tenancy with https://blog.anycable.io/p/multi-tenancy-vs-cables-introducing
    # Requires Rails 7.1
    # Currently solved in ApplicationCable::Channel on the channel level
  end
end
