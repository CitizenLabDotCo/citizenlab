# Impact Tracking

The impact tracking engine and its corresponding front-end module, track impact by measuring engagement in a privacy-friendly way. These metrics are not exposed in the product, but are used for Go Vocal's internal impact reporting. For this purpose, the numbers need to be highly accurate, but can lack detail.

## Session tracking

Currently the engine only performs session tracking.

### How are sessions tracked?

- Whenever the browser loads the front-end application, on launch, an API request is made to the back-end to store a session
- The back-end checks whether the user agent is a known crawler, and if so does nothing
- If the user is human, a session record is stored in the `sessions` table. It stores the current time and a `monthly_user_hash` to uniquely identify the user *within* the current month.

If we would only store a session once the application loads, when a user registers or signs in, no new session would be created and the session would be counted as a unauthenticated session. To deal with this, we update the current session at the moment a user registers or signs in to make it an authenticated session.

### How is the `monthly_user_hash` calculated?

Since visitors did not accept our cookie policy when the session is stored, we can't rely on a cookie to uniquely identify non-authenticated users that return to the platform. Instead, for non-authenticated visitors, we use the IP and the User-Agent to detect whether a user is returning. This is not fully accurate, but gives a good enough approximation of uniqueness. For authenticated users, we use the user ID.

However, to respect the user's privacy and to be in line with GDPR and other privacy regulations, we can't store this information(IP and user agent or user ID) without the user's consent. And we don't have their consent, at least not for unauthenticated users. So instead, we apply a unidirectional hash function and store its output. We don't store the raw IP, user agent or user ID. 

Since there are relatively little IP addresses and user agents, given the stored hash it would be possible to reconstruct the information using brute force. To counter that, we add a salt to the hash which automatically rotates every calendar month. Old salt values are hard-deleted every month, guaranteeing no user PII can be reconstructed from any previous months. The month boundary is a sensible tradeoff between privacy and accurate tracking of impact.

### How is the stored data used?

The session table is (currently) not used or displayed anywhere in the product, but used for Go Vocal's internal impact reporting. For Go Vocal staff, it's accessible through the internal Metabase. 
