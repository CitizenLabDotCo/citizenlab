# frozen_string_literal: true

require 'onelogin/ruby-saml/response'

# ruby-saml's `validate_num_assertion` and `issuers` use the XPath `//a:Assertion`,
# which matches `<Assertion>` elements at any depth. Some IdPs (notably FedERa,
# which embeds an underlying Lepida ID authentication assertion plus an
# attribute-mapping descriptor inside `<saml2:Advice>`) include nested assertions,
# so the unconstrained XPaths pick those up alongside the real top-level assertion
# and the count-based validations fail with:
#
#   - "SAML Response must contain 1 assertion"          (validate_num_assertion)
#   - "Issuer of the Assertion not found or multiple."  (validate_issuer / #issuers)
#
# Per SAML 2.0 §2.6.1, `<Advice>` is informational and MAY be ignored without
# affecting the validity of the enclosing assertion, so the correct interpretation
# is to only consider top-level assertions (direct children of `<Response>`).
#
# Scoped to responses that actually contain `<Advice>` with nested `<Assertion>`
# children, so that every other SAML strategy in the app keeps ruby-saml's
# stricter default behavior. Signatures are always validated against the
# unmodified document — only the lookup XPaths are narrowed, not the content fed
# to signature verification.
module OneLogin
  module RubySaml
    module AdviceTolerantValidation
      def validate_num_assertion
        return super unless advice_with_nested_assertions?

        error_msg = 'SAML Response must contain 1 assertion'
        namespaces = { 'p' => Response::PROTOCOL, 'a' => Response::ASSERTION }

        assertions = REXML::XPath.match(document, '/p:Response/a:Assertion', namespaces)
        encrypted_assertions = REXML::XPath.match(document, '/p:Response/a:EncryptedAssertion', namespaces)

        unless assertions.size + encrypted_assertions.size == 1
          return append_error(error_msg)
        end

        if decrypted_document
          decrypted_assertions = REXML::XPath.match(decrypted_document, '/p:Response/a:Assertion', namespaces)
          unless decrypted_assertions.size == 1
            return append_error(error_msg)
          end
        end

        true
      end

      def issuers
        return super unless advice_with_nested_assertions?

        @issuers ||= begin
          namespaces = { 'p' => Response::PROTOCOL, 'a' => Response::ASSERTION }

          issuer_response_nodes = REXML::XPath.match(document, '/p:Response/a:Issuer', namespaces)
          unless issuer_response_nodes.size == 1
            raise ValidationError, 'Issuer of the Response is missing or not unique.'
          end

          issuer_assertion_nodes = REXML::XPath.match(
            doc_to_validate,
            '/p:Response/a:Assertion/a:Issuer',
            namespaces
          )
          unless issuer_assertion_nodes.size == 1
            raise ValidationError, 'Issuer of the Assertion not found or multiple.'
          end

          (issuer_response_nodes + issuer_assertion_nodes).map { |node| Utils.element_text(node) }
        end
      end

      private

      def advice_with_nested_assertions?
        return @advice_with_nested_assertions if defined?(@advice_with_nested_assertions)

        @advice_with_nested_assertions = REXML::XPath.match(
          document,
          '//a:Advice/a:Assertion',
          { 'a' => Response::ASSERTION }
        ).any?
      end
    end

    class Response
      prepend AdviceTolerantValidation
    end
  end
end
