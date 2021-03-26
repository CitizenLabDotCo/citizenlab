# Monkey patching RspecApiDocumentation to fix API Documentation generation (CL2-5264).
# See more details here: https://github.com/zipmark/rspec_api_documentation/issues/456#issuecomment-597671587
# And more specifically here (the solution): https://github.com/zipmark/rspec_api_documentation/issues/456#issuecomment-597671587
#
# Excerpt:
# > Digging in further, we found out that in rack/rack@8c62821 [...], MockResponse#body
# > now creates a buffer and use << to join the content together. However, on line 195, the author uses String.new
# > without specifying the encoding, resulting in Ruby creating a new String with ASCII-8BIT encoding by default.
# > As it turns out, rspec_api_documentation relies on string encoding to determine if it should include the response
# > body in the documentation or not.

require 'rspec_api_documentation'

module RspecApiDocumentation
  class RackTestClient < ClientBase
    def response_body
      last_response.body.encode("utf-8")
    end
  end
end
