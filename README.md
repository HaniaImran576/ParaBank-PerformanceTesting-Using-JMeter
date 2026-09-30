# ParaBank Performance Testing with Apache JMeter

Performance test of the ParaBank demo banking application, covering the
user journey: **Register → Login → Open New Account → Transfer Funds →
Accounts Overview → Logout**.

## Objectives
- Build a multi-step JMeter test plan from a recorded browser flow
- Give each virtual user a unique account and an isolated session
- Validate every step with assertions, not just HTTP 200
- Find how the public demo instance behaves as load increases

## Tech Stack
- Apache JMeter (HTTP(S) Test Script Recorder, HTTP Cookie Manager,
  Regular Expression Extractor, Response Assertions)
- Target: ParaBank public demo (https://parabank.parasoft.com)

## Test Plan Design
| Concern | Approach |
|---|---|
| Session handling | HTTP Cookie Manager (separate cookie jar per thread) |
| Unique users | `testuser_${__threadNum}_${__time()}` |
| Correlation | Regex Extractor for account IDs |
| Validation | Response Assertions on key steps |

## Results (public ParaBank instance)

| Users | Ramp-up | Samples | Avg (ms) | Max (ms) | Error % |
|---|---|---|---|---|---|
| 1 | 5 s | 7 | 333 | 591 | 0.00% |
| 2 | 10 s | 14 | 601 | - | 0.00% |
| 3 | 15 s | 21 | 469 | - | 0.00% |
| 4 | 20 s | 28 | 467 | - | 0.00% |
| 5 | 25 s | 35 | 501 | - | 0.00% |
| 6 | 30 s | 42 | 460 | - | 0.00% |
| 7 | 35 s | 49 | 480 | - | 0.00% |
| 8 | 40 s | 56 | 467 | - | 0.00% |
| 9 | 45 s | 63 | 456 | 1088 | 0.00% |
| 10 | 50 s | 70 | 627 | 1920 | 0.00% |
| 10 (rerun) | 25 s | 70 | 458 | 1183 | 0.00% |
| 10 (first attempt) | 25 s | - | - | - | HTTP 429 observed |

## Key Findings

1. **Stable behavior at low load.** From 1 to 10 users, average response
   time stayed between roughly 330 and 630 ms with 0% errors in all
   completed runs. Max response time peaked at about 1.9 s.
2. **One transient HTTP 429.** My first 10-user run (25 s ramp-up) returned
   429 Too Many Requests. Re-running the identical configuration completed
   with 0% errors. I could not reproduce the 429, so I don't claim a
   specific threshold.
3. **Possible causes (not confirmed):** cumulative request volume from my
   IP during earlier debugging runs, other traffic on the shared server,
   or time-window-based rate limiting.

## Limitations
- Shared public server: results include network and server variability
- Small sample sizes, one run per configuration (except the 10-user case)
- Numbers are indicative, not a capacity benchmark
- Load was intentionally kept low out of respect for a shared service

## Lessons Learned
- A failure that doesn't reproduce is a finding to document, not to explain away
- Environment limits and application defects must be separated in analysis
- Serious load testing belongs on an environment you own

## How to Run
```bash
jmeter -n -t test-plan/parabank-test-plan.jmx -l results/results.jtl -e -o results/html-reports
```
> Only run against systems you own or have permission to test.

## Next Steps
- Run against a self-hosted ParaBank for higher concurrency (25 to 100+ users)
- Add the balance-conservation check across transfers under concurrent load
- Capture response headers on 429 (`Retry-After`, `X-RateLimit-*`) if it recurs
