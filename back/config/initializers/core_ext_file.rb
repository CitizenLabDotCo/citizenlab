# frozen_string_literal: true

class File
  class << self
    # The (deprecated) alias :exists? was removed in Ruby 3.2.3. However, the latest
    # version of rspec_api_documentation (6.1.0) still uses it. The latest version was
    # released on 2018-10-03, so it is unlikely that it will be updated to use exist?.
    # This patch simply adds the alias back in.
    alias exists? exist?
  end
end

class Object
  def not_in?(collection)
    !in?(collection)
  end
end
