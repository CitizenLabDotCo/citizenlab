# frozen_string_literal: true

# Self-signed certificate + key for MAGDA client specs. Generated once per process.
module MagdaTestCertificate
  module_function

  def key
    @key ||= OpenSSL::PKey::RSA.new(2048)
  end

  def certificate
    @certificate ||= begin
      cert = OpenSSL::X509::Certificate.new
      cert.version = 2
      cert.serial = 1
      cert.subject = OpenSSL::X509::Name.new([['C', 'BE'], ['O', '0207500420'], ['OU', 'test'], ['CN', '0207500420/test-aip']])
      cert.issuer = cert.subject
      cert.public_key = key.public_key
      cert.not_before = Time.now - 60
      cert.not_after = Time.now + 3600
      cert.sign(key, OpenSSL::Digest.new('SHA256'))
      cert
    end
  end

  def certificate_pem
    certificate.to_pem
  end

  def private_key_pem
    key.to_pem
  end
end
