# Verification

Is a citizen who she says she is?

## Base verification method

This is the basis for every verification method.

Let's add a new method by example: We're going to verify a user by their DNA.

```ruby
module Verification
  module Methods
    class DNA
      include VerificationMethod

      # The type of verification method. Either :manual_sync or :omniauth
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

      # A list of configuration parameters. 
      # These are considered private and won't be exposed to
      # non-admins through the API. Use them to hold any values that are
      # needed to perform verification. By default, the values you'll receive are
      # strings. In case you don't need any parameters, return an empty array.
      def config_parameters
        [:dna_database_login, :dna_database_password]
      end

      # An optional method which lets you define custom JSON Schema
      # definitions for some or all of the config_parameters. Config
      # parameters without a specified schema default to type string.
      def config_parameters_schema
        {
          dna_database_password: {
            private: true,
            type: 'string',
            minLength: 8,
          }
        }
      end

      # An optional method which lets you expose some of the
      # config_parameters. They will be included in the API response that
      # lists the verification methods, for a front-end to use.
      def exposed_config_parameters
        [:dna_database_login]
      end

      # A list of verification parameters. Their values will be provided by the
      # user at the moment they want to verify themselves. 
      def verification_parameters
        [:dna_string]
      end

      # A list of user attributes that should be unchangeable by the user,
      # when they're verified using this method
      def locked_attributes
        [:email]
      end

      # A list of custom field keys that should be unchangeable by the user,
      # when they're verified using this method. Make sure that the 
      # corresponding custom field is in place and enabled.
      def locked_custom_fields
        [:gender]
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


## Adding a manual synchronous verification method

A manual synchronous verification method lets a user verify themselves by entering certain information like e.g. their ID card number.

* **manual**: The user needs to manually enter information about themselves.
* **synchronous**: The verification immediately returns and the user knows without delay that they're verified or not.

To do so, the class needs to implement the `verify_sync` method. 

```ruby
module Verification
  module Methods
    class DNA
      include VerificationMethod

      def veritication_method_type
        :manual_sync
      end

      # ... all properties described in base verification method
      
      # It's the responsibility of `verify_sync` to raise any of the following
      # exceptions if verification doesn't work out:
      # * VerificationService::NoMatchError When there's no match using the method
      # * VerificationService::NotEntitledError When the citizen is found, but 
      #   doesn't have sufficient civil rights to be considered verified
      # * VerificationService::ParameterInvalidError When a given input parameter 
      #   is invalid
      #
      # It has to return a hash with following keys:
      # {
      #   uid: The unique uid string of the user for this method
      #   attributes: Hash of attributes that should be set on the user
      #   custom_field_values: Hash of custom field values that should be merged into the user's current values
      # }
      # Only the `uid` key is required
    }
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

By implementing the verification method, a new route will be exposed at `POST verification_methods/dna/verification` that expects the verification parameters in the format `{verification: {dna_string: 'ACAAGGACAT'}}`

It's best to implement an acceptance test for the endpoint, and a unit test for the `verify_sync` implementation. See `Cow` as an example.

## Adding an omniauth verification method

An omniauth verification method lets the user verify themselves by sending the user through an external authentication provider, using the omniauth middleware. It's typically used for authentication providers like FranceConnect or Itsme.

An omniauth verification method is an OmniauthMethod, defined in the base apps `lib`, with an extra mixin that defines the methods documented in the base verification method. Only the mixin is defined in this engine. See for example `bosa_fas`.

## Methods

### cow

COW is an API to validate a social security number, called RUN, and serial number, against a central database in Chile.

By default, the method is configured to fake the API calls to ease development and setup. Here's how to configure it to make real requests against the API, as is happening in production.

1) Add the client-side SSL certificate to a file called `secrets/cow_ssl_cert_file` in cl2-back. The certificate originally got delivered as a `.p7b` file. To use it here, we need to convert it to a `.pem` with the following command:
```sh
openssl pkcs7 -print_certs -in im_penalolen_ssl.p7b -out im_penalolen_ssl.pem
```
2) Add the client-side SSL private key to a file called `secrets/cow_ssl_cert_key_file`. The private key is the one we generated together with the CSR file, that we sent to Chile to get our certificate.

3) Edit the following 2 variables in `.env` and point them to your new files:
```
VERIFICATION_COW_SSL_CERT_FILE=./secrets/cow_ssl_cert_file
VERIFICATION_COW_SSL_CERT_KEY_FILE=./secrets/cow_ssl_cert_key_file
```

4) Activate cow as a verification method in the application configuration and add the right values for `api_username`, `api_password` and `rut_empresa`.

### id_card_lookup

### bosa_fas

### franceconnect