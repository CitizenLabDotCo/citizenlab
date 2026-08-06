# NemLog-in SP metadata & certificate rotation

This directory holds **example** Service Provider (SP) metadata for the NemLog-in
SAML integration (`production.xml`). The real per-tenant SP metadata is not stored
here — it is uploaded to the NemLog-in Administration panel. Use the example as
the starting template.

The concrete live example throughout is **Copenhagen** (`kobenhavntaler.kk.dk`),
whose NemLog-in IT-system is named `Citizenlab_F4608_OKF`, entityID
`https://kobenhavntaler.kk.dk`, registered as a **public** system (so it may
request `cprNumber`), and using the Copenhagen KKI address lookup. Copenhagen is
already live in production with an existing MitID Erhverv (production) agreement.

> **TL;DR of a rotation.** You need **two** certs: a **test** OCES3 cert to pass
> the integration test, and the **production** OCES3 cert for the live tab. Run
> the integration test on **staging (`demo.stg.govocal.com`)** so the live tenant
> is never touched. **Go Vocal** produces the certs/metadata/report and configures
> AdminHQ; **Copenhagen (the NemLog-in tech admin)** does every upload/approval in
> the admin panel. Full step list under "Rotation runbook" below.

## The mental model

A NemLog-in integration uses **one keypair**, and the two halves live in two
different places:

- **Private key** — lives on *our* side. The backend uses it to *sign* the SAML
  AuthnRequests we send to NemLog-in. Stored as a plain PEM string in the
  platform config: `id_config.id_methods` → the `nemlog_in` entry →
  `private_key` field. Edited via **AdminHQ**.
- **Public certificate** — lives on *NemLog-in's* side. Embedded in the SP
  metadata XML uploaded to the NemLog-in admin panel. NemLog-in uses it to
  *verify* the signatures on the requests we send.

There is **no separate certificate field** in our config — only `private_key`.
The public cert is never configured on our side; it only lives in the uploaded SP
metadata. (`nemlog_in_omniauth.rb` comments that `certificate` isn't needed
because it's in the SP metadata file.) A `.p12` from the CA contains **both
halves**, and the two sides must always match — updating only one breaks signing.

The code builds the request from two independent per-tenant values
(`nemlog_in_omniauth.rb`):

```ruby
sp_entity_id:                  config[:issuer]                                     # a STRING (the entityID)
assertion_consumer_service_url: "#{configuration.base_backend_uri}/auth/nemlog_in/callback"  # from the TENANT HOST
```

`base_backend_uri` is `https://<tenant-host>` in production (`app_configuration.rb`).
The entityID (`issuer`) is decoupled from the host — which is what makes the
zero-downtime staging approach below possible.

## The three NemLog-in environments (read this first)

NemLog-in has **three separate environments**, each a distinct system with its own
admin panel, its own IdP, its own registration, and its own **required certificate
type**. Our config's `environment` value selects one; the IdP hostnames are from
the committed files in `../idp_metadata/`.

| Our `environment` | NemLog-in IdP host | Admin panel (SP metadata) | MitID Erhverv admin | Cert required |
|---|---|---|---|---|
| `pre_production_integration` | `saml.test-devtest4-nemlog-in.dk` | `administration.devtest4-nemlog-in.dk` | `erhvervsadministration.test-devtest4-nemlog-in.dk` | **test** OCES3 |
| `production_integration` (IntTest) | `saml.test-nemlog-in.dk` | `administration.test-nemlog-in.dk` | `erhvervsadministration.test-nemlog-in.dk` | **test** OCES3 |
| `production` | `saml.nemlog-in.dk` | `administration.nemlog-in.dk` | `erhvervsadministration.nemlog-in.dk` | **production** OCES3 |

(Only the production admin URL is officially confirmed; the two test URLs follow
NemLog-in's `administration.<idp-host-minus-saml.>` pattern — check the URL bar.
Log into the MitID Erhverv test admin via the **"Test Login"** tab.)

A registration in one environment **does not exist** in the others. In NemLog-in
Administration a single IT-system shows an **Integration** tab and a **Produktion**
tab side by side; they hold separate metadata, certs and connection status.

## Two OCES certificate types — the #1 gotcha

- **Production** OCES3 certs chain to `CN=Den Danske Stat OCES rod-CA, O=Den Danske
  Stat, C=DK`.
- **Test** OCES3 certs chain to `CN=Den Danske Stat OCES rod-CA, **OU=Test - cti**,
  O=Den Danske Stat, C=DK`.

Test environments require a **test** cert; production requires a **production**
cert. A production `.p12` **cannot** validate in a test environment (and vice
versa) — no technical-admin toggle changes this. All test OCES3 certs chain to the
single test root, so one test cert works across the test environments.

## The integration-test gate

To enable/keep production, NemLog-in requires the IT-system to **pass an
integration test** in a test environment. **Changing the certificate is a metadata
change, which re-triggers this integration test** — even for an already-live
system. In the Integration tab the "Status for tilslutning" stepper resets to
step 1 after a cert change:

| Step | Danish | Meaning | Responsible |
|---|---|---|---|
| 1 | Påbegyndt | Started | Technical admin |
| 2 | Integration test (klar) | Test ready | Technical admin |
| 3 | Integration test (gennemført) | Test performed | Technical admin |
| 4 | Integration test (godkendt) | Test **approved** | NemLog-in Support (a robot) |

Production accepts the new cert only after step 4. **Note:** during integration
testing the metadata is *locked*; approval unlocks it.

## Who does what

Access is split and neither side can do the other's part:

- **Go Vocal** — owns AdminHQ (the platform config) and the SP metadata XML.
  Produces certs/`.cer` files, builds metadata, configures the tenant, runs the
  test login, fills the test report. **Has no NemLog-in admin-panel access.**
- **Copenhagen — the NemLog-in technical administrator** (currently **Patrick
  Znaty**; originally **Flemming Bremer**, Koncern IT). Holds the admin-panel
  login (a Danish MitID Erhverv) and does **every upload/approval**: Skift
  certifikat, Valider, Provisioner, Indlæs testrapport, approve to production.
- **Copenhagen business/IT** (originally Aja Faurschou Enghoff / Torben Immisch)
  — **orders the production OCES3 certificate**. It is issued by the municipality,
  not the vendor, and delivered to Go Vocal.
- **NemLog-in / Digitaliseringsstyrelsen** — a robot approves the integration
  test; Nets service desk (ticket lineage `SERV0265964`) answers SAML questions
  (slow, 10+ days).

## Zero-downtime approach: run the integration test on staging

Because the entityID is decoupled from the callback host, the integration test can
run on a **non-live** instance, leaving `kobenhavntaler.kk.dk` untouched. Use
**`demo.stg.govocal.com`**.

**Precedent:** this is how it was done originally. In the 2023 implementation the
integration test ran against the staging demo platform **`demo.stg.citizenlab.co`**
(the pre-rebrand name of `demo.stg.govocal.com`) and a localtunnel
(`nemlogin-k3kd.loca.lt`) as the callback — never the live tenant. A stable
staging host like `demo.stg.govocal.com` is better than a per-session tunnel
because the ACS URL won't change under you.

The trick: keep `entityID` = the live Copenhagen value, but point the callback at
staging.

- **Integration-tab SP metadata**: `entityID = https://kobenhavntaler.kk.dk`
  (unchanged — it can't be changed), ACS `Location =
  https://demo.stg.govocal.com/auth/nemlog_in/callback`, SLO `Location`/
  `ResponseLocation = https://demo.stg.govocal.com/`. (Location URLs are
  changeable; entityID is the sticky one.)
- **`demo.stg.govocal.com` tenant `nemlog_in` config**: `environment:
  production_integration`, `issuer: https://kobenhavntaler.kk.dk` (matches the
  entityID), `private_key` = the **test** key, method enabled.

The live Produktion tab and tenant are not touched until the final cert swap.

**Caveats for the shared demo tenant:** it's shared, so the config change is
temporary — revert it after. KKI won't resolve *test* CPRs, so
`fetch_municipality_code` returns empty for a MitID test user (fine for NemLog-in
approval, but confirm the flow doesn't hard-error and the `municipality_code`
custom field exists on the demo tenant). Confirm demo.stg runs in non-dev mode so
`base_backend_uri` is really `https://demo.stg.govocal.com`.

## Rotation runbook (owner-tagged)

Assumes an already-live system (Copenhagen), rotating to a new production cert,
testing on `demo.stg.govocal.com`.

| # | Owner | Action |
|---|---|---|
| 0 | **Go Vocal** | In AdminHQ, **copy the current live `private_key` value out** (rollback). |
| A1 | **Go Vocal** | Issue a **test OCES3 cert yourself** (self-service, see below — no Copenhagen dependency; a test cert from any test org validates). Keep the `.p12` + password. |
| B1 | **Go Vocal** | Extract from the test `.p12`: `openssl pkcs12 -in test.p12 -out test.crt.pem -clcerts -nokeys` and `openssl pkcs12 -in test.p12 -out test.key.pem -nocerts -nodes` |
| B2 | **Go Vocal** | Build the integration metadata (`demo-integration.xml`, script below) and `openssl x509 -in test.crt.pem -outform DER -out test.cer` |
| B3 | **Go Vocal** | AdminHQ → **demo.stg.govocal.com** tenant → `nemlog_in`: `environment: production_integration`, `issuer: https://kobenhavntaler.kk.dk`, `private_key` = test key, method enabled |
| C1 | **Go Vocal → Copenhagen** | Send `test.cer` + `demo-integration.xml` |
| C2 | **Copenhagen** | **Integration** tab → **Skift certifikat** → `test.cer`, tick "same cert for signing + encryption" → **Valider**; upload `demo-integration.xml` (Indlæs metadatafil) so ACS = demo.stg; → **Provisioner til integrationstest** |
| D1 | **Go Vocal** | Create a **private MitID test user WITH CPR** at `mitidsimulator.test-nemlog-in.dk` |
| D2 | **Go Vocal** | Run the verify flow on `https://demo.stg.govocal.com` with the test user; confirm the SAML round-trip completes |
| D3 | **Go Vocal** | Fill the **testrapport** (verify-only model, assurance level "Low", OIOSAML3) |
| E1 | **Go Vocal → Copenhagen** | Send the completed report |
| E2 | **Copenhagen** | **Indlæs testrapport** → submit |
| E3 | **NemLog-in robot** | Approves ("Integrationstesten er nu godkendt"); metadata unlocks |
| F1 | **Go Vocal** | `openssl x509 -in citizenlab.crt.pem -outform DER -out prod.cer`; send to Copenhagen |
| F2 | **Copenhagen** | **Produktion** tab → **Skift certifikat** → `prod.cer`, same tick |
| F3 | **Go Vocal** | Revert demo.stg config; set **live** `kobenhavntaler.kk.dk` tenant → `environment: production` + production key |
| F4 | **Go Vocal** | End-to-end verify on `kobenhavntaler.kk.dk`; delete local cert files |

**Coordination:** the flow ping-pongs (Go Vocal makes a file → Copenhagen uploads →
Go Vocal tests → Copenhagen submits). Line up the NemLog-in admin to be available
for C2, E2, F2. Keep the window between B3 and F3 short.

## Getting a test OCES3 certificate (self-service)

**Go Vocal can do this alone** — the test cert only has to chain to the test OCES
root; it need not be issued under Copenhagen's CVR or tied to the IT-system. This
is how it was originally created (NemLog-in guide "IdM API, API Systemcertificate",
by Pavol Lantaj), using a self-created test org. Copenhagen is *not* needed for
cert generation — only for the later admin-panel uploads.

The cert is issued in **MitID Erhverv admin (erhvervsadministration)**, not the
testportal — the testportal only creates the org. The self-service environment is
**devtest4**. (A devtest4 cert chains to the same test OCES root and validates in
IntTest too.)

1. **Create a test org** (dummy CVR, no login): `https://testportal.test-devtest4-nemlog-in.dk/BO`
   → fictitious CVR starting with `9` + test login credentials (wait a few minutes
   to activate).
2. **Log into MitID Erhverv test admin**: `https://erhvervsadministration.devtest4-nemlog-in.dk/`
   via the **"Test login"** tab.
3. **Certifikater** → **Opret certifikatprofil**. Field choices:
   - *Certifikatnavn*: any descriptive name (e.g. `GovocalCopenhagenTest`);
     email/contact fields are optional.
   - *Systemrettigheder* (Trin 2): leave **both unchecked** (IdM services /
     certificate management are for the user-provisioning API — not needed).
   - *Signering* (Trin 3): **keep checked** — "…må bruges til at danne segl for
     organisationen" — this makes it a signing cert.
   - *Certifikater* (Trin 4): **Type af certifikat** = **Organisationscertifikat**
     (machine/organisation cert, not personal); **Metode til identifikation** =
     **Bruger-login**; **Metode til udstedelse** = **Internetbrowser** (generates a
     downloadable `.p12` *with* the private key — **not** Hardware or System/EST
     API, which don't give you the key). Leave "Føj … til den offentlige
     certifikatdatabase" unchecked.
4. **Bestil nyt certifikat** → **Udsted** the pending cert → accept terms.
5. **Save the password** (shown once). Download the `.p12`.

> **Cost check:** in devtest4 the test cert is **free**. If the form warns it
> "will cost money", you're probably on the *production* portal
> (`erhvervsadministration.nemlog-in.dk`) — stop and switch to the `devtest4` one.

The IntTest equivalents (if you must issue there) are
`testportal.test-nemlog-in.dk/BO` and `erhvervsadministration.test-nemlog-in.dk/`,
but devtest4 self-service is the reliable route.

(Ignore the Postman/Swagger/IdM-API-call parts of that guide — those are for
provisioning users via API, not needed for the SAML verify flow.)

## Creating a test user

Copenhagen's flow needs the CPR, so create a **private** MitID test identity **with
a CPR number** (NemLog-in guide "How to create MitID test users"):

1. Open the MitID Simulator `https://mitidsimulator.test-nemlog-in.dk/`.
2. Create a private MitID test identity — **tick "Private MitID" and set a CPR
   number** (registers it in the test-CPR register so you get name + CPRUUID +
   `cprNumber` back).
3. Shortcut: ready-made users **Ellie999 / Sabastian555 / Stig777**, password
   `Test1234` — but for the CPR/municipality check use your own with a known CPR.

## Extracting keys and making `.cer` files

From a `.p12` (test or production). Add **`-legacy`** to the `pkcs12` commands if
openssl errors with `unsupported` / `Mac verify error` (older `.p12` encryption):

```bash
DIR=back/tmp/nemlogin_crt
# public cert + private key (you'll be prompted for the .p12 password)
openssl pkcs12 -in "$DIR/<name>.p12" -out "$DIR/<name>.crt.pem" -clcerts -nokeys
openssl pkcs12 -in "$DIR/<name>.p12" -out "$DIR/<name>.key.pem" -nocerts -nodes
# .cer for Skift certifikat (DER)
openssl x509 -in "$DIR/<name>.crt.pem" -outform DER -out "$DIR/<name>.cer"
```

Name them so they can't be confused: **`test.cer`** (Integration tab) vs
**`production.cer`** (Produktion tab). The private key (`*.key.pem`) for AdminHQ
must start with `-----BEGIN PRIVATE KEY-----`; delete any `Bag Attributes` lines
above it, and if it's `BEGIN RSA PRIVATE KEY` convert with
`openssl pkcs8 -topk8 -nocrypt -in <key>.pem -out <key>.pk8.pem`.

## Building SP metadata from the template

Start from `production.xml`. `PLATFORM_DOMAIN` is the **SP** domain (our platform),
not NemLog-in's. `entityID` is permanent and must match the existing registration;
`*Location` URLs are changeable and must point at the host that handles the
callback. Keep `cprNumber` for Copenhagen (KKI needs it); remove only if the
service is registered as `private`.

**Production metadata** (entityID + callback both the live host):

```bash
cd <repo-root>
TEMPLATE=back/engines/commercial/custom_id_methods/config/saml/nemlog_in/sp_metadata_examples/production.xml
python3 - "$TEMPLATE" back/tmp/nemlogin_crt/production_kobenhavntaler.xml back/tmp/nemlogin_crt/citizenlab.crt.pem <<'PY'
import re, subprocess, sys
tmpl, out, crt = sys.argv[1:4]
pem = subprocess.check_output(["openssl","x509","-in",crt,"-outform","PEM"]).decode()
body = "\n".join(l for l in pem.splitlines() if "CERTIFICATE" not in l and l.strip())
xml = open(tmpl).read().replace("PLATFORM_DOMAIN", "kobenhavntaler.kk.dk")
xml, n = re.subn(r"(<X509Certificate>).*?(</X509Certificate>)",
                 lambda m: m.group(1)+body+m.group(2), xml, flags=re.DOTALL)
open(out,"w").write(xml)
print(f"wrote {out}; entityID+ACS=kobenhavntaler.kk.dk; cert blocks={n}")
PY
```

**Integration metadata** (entityID = Copenhagen, callback = staging):

```bash
cd <repo-root>
TEMPLATE=back/engines/commercial/custom_id_methods/config/saml/nemlog_in/sp_metadata_examples/production.xml
python3 - "$TEMPLATE" back/tmp/nemlogin_crt/demo-integration.xml back/tmp/nemlogin_crt/test.crt.pem <<'PY'
import re, subprocess, sys
tmpl, out, crt = sys.argv[1:4]
pem = subprocess.check_output(["openssl","x509","-in",crt,"-outform","PEM"]).decode()
body = "\n".join(l for l in pem.splitlines() if "CERTIFICATE" not in l and l.strip())
xml = open(tmpl).read()
xml = xml.replace('entityID="https://PLATFORM_DOMAIN"', 'entityID="https://kobenhavntaler.kk.dk"')
xml = xml.replace("PLATFORM_DOMAIN", "demo.stg.govocal.com")   # ACS/SLO Locations
xml, n = re.subn(r"(<X509Certificate>).*?(</X509Certificate>)",
                 lambda m: m.group(1)+body+m.group(2), xml, flags=re.DOTALL)
open(out,"w").write(xml)
print(f"wrote {out}; entityID=kobenhavntaler.kk.dk; ACS=demo.stg.govocal.com; cert blocks={n}")
PY
```

> Note: the cert files live under a gitignored `back/tmp/` dir and match secret
> patterns, so the Bash/Read tools are blocked from them — run these commands
> yourself in a terminal.
>
> If the heredoc hangs at a `heredoc>` prompt (a zsh interactive-paste quirk),
> Ctrl-C and instead save the Python to a file and run `python3 that_file.py` —
> e.g. `back/tmp/build_integration.py`, which reads `test.crt.pem` directly (no
> heredoc, no openssl subprocess).

## Skift certifikat vs full metadata upload

- **Skift certifikat** ("Change certificate", under "Løs opgaver") swaps only the
  cert from a **`.cer`** file, preserving entityID/endpoints/attributes. Cleaner
  for a pure cert rotation. The form has **separate signing and encryption fields**
  plus a **"use the same certificate for both"** checkbox — tick it (our SP uses
  one cert for both).
- **Indlæs metadatafil** replaces the whole metadata XML. Use this when you also
  need to change endpoints (e.g. pointing the Integration ACS at `demo.stg`).

Either way, changing the cert re-triggers the integration test (see the gate
above).

## Common errors (NemLog-in Administration validation)

- **`SigningCertificateValidation` — "Intermediate certificate not issued by the
  configured OCES environment root certificate … != …OU=Test - cti…"**: wrong cert
  type for the tab (production cert in a test env, or vice versa). Use the matching
  type. The "OCES environment is wrongly configured" line is a generic hint; the
  real cause is almost always the wrong cert type.
- **`EncryptionCertificateValidation` — "Fejl: Certifikat mangler"**: the
  encryption cert slot is empty. Tick "use the same certificate for signing and
  encryption", or upload the same `.cer` into both fields.
- **"Invalid Signature on SAML Response" in production**: NemLog-in rotated its IdP
  metadata — refresh `../idp_metadata/*.xml` (see below).

## IDP metadata (separate, FYI)

NemLog-in's *own* signing certs live in the IDP metadata files committed under
`../idp_metadata/<environment>.xml`, downloaded from NemLog-in as-is. They
occasionally rotate — you usually find out via a production error — in which case
download the new file from <https://www.nemlog-in.dk/metadata/#broker-idp> and
commit it. (NemLog-in rotated its production IdP cert in Jan 2026; the previous one
is kept as `../idp_metadata/production_pre_jan_26.xml`.) Unrelated to our SP
keypair rotation.

## Key facts & history

- IT-system: `Citizenlab_F4608_OKF`; entityID `https://kobenhavntaler.kk.dk`;
  registered **public** (may request `cprNumber`). Company/"Virksomhed": Have a
  say ApS.
- Original implementation: May–Sept 2023, live 22 Aug 2023. Vendor dev did all
  SAML work; the municipality's technical admin did all admin-panel uploads; the
  municipality ordered the production OCES3 cert; NemLog-in's robot approved the
  integration test.
- Certificate expiry drives rotation: the previous production cert prompted a
  rotation due mid-2026. The current production cert (`ØKF-4608`) is valid until
  10-06-2029.
- KKI = Københavns Kommunes Integrationsplatform, a Copenhagen-only service that
  turns a verified CPR into a municipality code (`fetch_municipality_code`), to
  confirm the citizen lives in Copenhagen. It does not resolve test CPRs.
