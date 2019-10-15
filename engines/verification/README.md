# Verification

Is a citizen who she says she is?

## Adding a manual synchronous verification method

A manual synchronous verification method lets a user verify themselves by entering certain information like e.g. their ID card number.

* **manual**: The user needs to manually enter information about themselves.
* **synchronous**: The verification immediately returns and the user knows without delay that they're verified or not.

Let's add a new method by example: We're going to verify a user by their DNA.

```ruby
module Verification
  module Methods
    class DNA
      include VerificationMethod

      def veritication_method_type
        :manual_sync
      end

      # Return a new random uuid, which will be used to uniquely identify the method.
      # This is currently used in the JSON API responses in the web_api, when
      # listing all verification methods. Required.
      def id
        "8180b1f0-045f-4abb-840e-e28d95fe659c"
      end

      # String identifier to uniquely identify the method. Used in e.g. the
      # routes. Required.
      def name
        "dna"
      end

      # A list of configuration parameters. Their values can be specified per
      # tenant in Admin HQ. These are considered private and won't be exposed to
      # non-admins through the API. Use them to hold any values that are
      # needed to perform verification. The values you'll receive are always
      # strings. In case you don't need any parameters, return an empty array.
      def config_parameters
        [:dna_database_login, :dna_database_password]
      end

      # A list of verification parameters. Their values will be provided by the
      # user at the moment they want to verify themselves. 
      def verification_parameters
        [:dna_string]
      end

      # Perform the actual verification. It receives the verification parameters
      # as a symbol hash, passed down from the user who inputted them
      # 
      # If successful, this should return a unique identifier string for the user
      # from the point of view of the verification method. The system will
      # compare against this identifier to make sure multiple users aren't using
      # the same identity.
      # 
      # It's the responsibility of `verify_sync` to raise any of the following
      # exceptions if verification doesn't work out:
      # * VerificationService::NoMatchError When there's no match using the method
      # * VerificationService::ParameterInvalidError When a given input parameter is invalid
      def verify_sync dna_string:
        raise ParameterInvalidError.new("dna_string") if invalid_dna?(dna_string)
        response = check_dna_db(
          config[:dna_database_login],
          config[:dna_database_password],
          dna_string
        )
        if response.ok?
          response.user_id
        else
          raise VerificationService::NoMatchError.new
        end
      end
    end
  end
end
```

To enable your new method, make sure to add an instance to the `ALL_METHODS` constant in `VerificationService`

```ruby
  ALL_METHODS = [
    # ...
    Methods::DNA.new
  ]
```

By implementing the verification method, a new route will be exposed at `POST verification_methods/dna/verification` that expects the verification parameters in the format `{verification: {dna_string: 'ACAAGGACAT'}}`

It's best to implement an acceptance test for the endpoint, and a unit test for the `verify_sync` implementation. See `Cow` as an example.
