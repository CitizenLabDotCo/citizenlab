# frozen_string_literal: true

module IdCow
  class CowVerification < IdMethod::Base
    include IdMethod::VerificationMethod

    SHARED_SAVON_CONFIG = {
      wsdl: 'https://terceros.sidiv.registrocivil.cl:8443/InteroperabilityPlateform/TercerosCOWProxyService?wsdl',
      ssl_cert_file: ENV.fetch('VERIFICATION_COW_SSL_CERT_FILE'),
      ssl_cert_key_file: ENV.fetch('VERIFICATION_COW_SSL_CERT_KEY_FILE'),
      ssl_verify_mode: :none,
      # log: true,
      # log_level: :debug,
      # pretty_print_xml: true,
      namespaces: {
        'xmlns:typens' => 'http://tempuri.org/COW/type/'
      }
    }

    def verification_method_type
      :manual_sync
    end

    def id
      '7ccd453d-0eaf-412a-94a2-ae703b1b3e3f'
    end

    def name
      'cow'
    end

    def config_parameters
      %i[api_username api_password rut_empresa]
    end

    def verification_parameters
      %i[run id_serial]
    end

    def verify_sync(run:, id_serial:)
      raise Verification::VerificationService::ParameterInvalidError, 'run' unless run_valid?(run)
      raise Verification::VerificationService::ParameterInvalidError, 'id_serial' unless id_serial_valid?(id_serial)

      cow_valid_citizen!(run, id_serial)
    end

    private

    def cow_valid_citizen!(run, id_serial)
      client = Savon.client(SHARED_SAVON_CONFIG.merge({
        wsse_auth: [config[:api_username], config[:api_password]]
      }))

      response = client.call(
        :get_data_document,
        message: {
          'typens:RUTEmpresa' => config[:rut_empresa],
          'typens:DVEmpresa' => 'k',
          'typens:CodTipoDocumento' => 'C',
          'typens:NumRUN' => clean_run(run),
          'typens:NumSerie' => clean_id_serial(id_serial)
        }
      )

      valid_response!(**response.body[:get_data_document_response].slice(:ind_vigencia, :ind_bloqueo, :estado_respuesta))
      {
        uid: response.body[:get_data_document_response][:num_serie]
      }
    end

    # A transaction is successful if it meets one of the following rules:
    #
    # 1:
    # Any person with IndVigencia = S can react.
    # <type:IndVigencia>S</type:IndVigencia>
    #
    # 2:
    # If IndVigencia is not in 'S', check other rules.  Here are the exceptions that allow you to react:
    #     2.1
    #     <type:IndVigencia>N</type:IndVigencia>
    #     +
    #     <type:IndBloqueo>NO BLOQUEADO</type:IndBloqueo>
    #     2.2:
    #     <type:IndVigencia>N</type:IndVigencia>
    #     +
    #     <type:IndBloqueo>RENOVACION</type:IndBloqueo>
    #     2.3
    #     <type:IndVigencia>N</type:IndVigencia>
    #     +
    #     <type:IndBloqueo>TEMPORAL</type:IndBloqueo>
    # **Both IndVigencia and IndBloqueo conditions must be met.

    # For all other combinations that do not fit in these 4 alternatives, they must be blocked from reacting.
    def valid_response!(estado_respuesta:, ind_vigencia: nil, ind_bloqueo: nil)
      raise Verification::VerificationService::NoMatchError if estado_respuesta != '000'
      return if ind_vigencia == 'S' || (ind_vigencia == 'N' && ['NO BLOQUEADO', 'RENOVACION', 'TEMPORAL'].include?(ind_bloqueo))

      raise Verification::VerificationService::NotEntitledError
    end

    def run_valid?(run)
      run.present? && /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]{1}$/.match?(run.strip)
    end

    def clean_run(run)
      run.strip.split('-').first.tr('^0-9', '')
    end

    def id_serial_valid?(id_serial)
      id_serial.strip.present?
    end

    def clean_id_serial(id_serial)
      id_serial.tr('^0-9a-zA-Z', '')
    end
  end
end
