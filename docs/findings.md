# Findings: ParaBank JMeter Performance Test

## 1. Scope
- **Target:** ParaBank public demo (https://parabank.parasoft.com)
- **Flow tested:** Register → Login → Open New Account → Transfer Funds → Accounts Overview → Logout
- **Tool:** Apache JMeter
- **Load range:** 1 to 10 virtual users, ramp-up of 5 s per user (plus one 10-user run at 2.5 s per user)
- **Constraint:** Shared public server, so load was intentionally kept low.

## 2. Test Configuration
| Item | Setup |
|---|---|
| Session handling | HTTP Cookie Manager (isolated cookies per thread) |
| Unique users | `testuser_${__threadNum}_${__time()}` |
| Correlation | Regex Extractor for account IDs |
| Validation | Response Assertions on key steps |
| Execution | (fill in: GUI or CLI non-GUI mode) |

## 3. Results

| Run | Users | Ramp-up | Samples | Avg (ms) | Min / Max (ms) | Throughput | Error % |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 5 s | 7 | 333 | 284 / 591 | 2.7/sec | 0.00% |
| 2 | 2 | 10 s | 14 | 601 | - | - | 0.00% |
| 3 | 3 | 15 s | 21 | 469 | - | - | 0.00% |
| 4 | 4 | 20 s | 28 | 467 | - | - | 0.00% |
| 5 | 5 | 25 s | 35 | 501 | - | - | 0.00% |
| 6 | 6 | 30 s | 42 | 460 | - | - | 0.00% |
| 7 | 7 | 35 s | 49 | 480 | - | 57.2/min | 0.00% |
| 8 | 8 | 40 s | 56 | 467 | - | 59.6/min | 0.00% |
| 9 | 9 | 45 s | 63 | 456 | 287 / 1088 | 1.0/sec | 0.00% |
| 10 | 10 | 50 s | 70 | 627 | 295 / 1920 | 1.0/sec | 0.00% |
| 10a | 10 | 25 s | not recorded | - | - | - | **HTTP 429 observed** |
| 10b (rerun) | 10 | 25 s | 70 | 458 | 286 / 1183 | 1.6/sec | 0.00% |

> Fill in the `-` cells from your Summary Reports if you want a complete table. Do not estimate them.

## 4. Observations
1. **No errors in any completed run.** All runs from 1 to 10 users finished with 0.00% errors.
2. **Average response time** stayed between 333 and 627 ms. The 2-user run (601 ms) and the 10-user run at 50 s ramp-up (627 ms) were the highest averages.
3. **Maximum response time** reached 1920 ms in the 10-user / 50 s run. Other runs with recorded maximums peaked at 1088 ms and 1183 ms.
4. **No clear upward trend** with user count. At this load level, differences are small enough that network jitter and normal server variation could explain them.

## 5. The HTTP 429 Event
| | First attempt (10a) | Rerun (10b) |
|---|---|---|
| Users | 10 | 10 |
| Ramp-up | 25 s | 25 s |
| Result | HTTP 429 Too Many Requests | 0.00% errors, avg 458 ms |

**What this shows:** The same configuration failed once and passed once. The 429 was **not reproduced**.

**Possible causes (unconfirmed):**
- Cumulative requests from my IP during earlier debugging and recording
- Other traffic on the shared server at the time
- Rate limiting based on a time window or counter state

**What I did not conclude:** I did not claim a user-count threshold or a request-rate threshold. One failure that does not reproduce is not enough evidence for either.

**If it recurs, capture:**
- Response headers (`Retry-After`, `X-RateLimit-*`)
- Exact time of the failure
- Number of requests sent from the same IP in the preceding minutes

## 6. Limitations
- One run per configuration (except the 10-user case)
- Small sample sizes (7 samples per user)
- Shared public server, so results include network and server variability
- Results are indicative, not a capacity benchmark
- Data integrity (balance conservation) was **not** verified under load

## 7. Conclusions
- At 1 to 10 users with gentle ramp-up, the public ParaBank instance responded without errors in every completed run.
- A single transient 429 appeared and could not be reproduced, so no rate-limit threshold is claimed.
- Meaningful higher-concurrency testing needs a self-hosted instance.

## 8. Next Steps
1. Run ParaBank locally (Docker or the official open-source build) and test 25 / 50 / 100 users
2. Add the balance-conservation check (sum of both account balances before vs. after transfer)
3. Capture 429 response headers if rate limiting appears again
4. Compare the self-hosted results with the public-instance baseline
