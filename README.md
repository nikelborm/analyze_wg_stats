# analyze_wg_stats

This is a script to output usage of wg vpn server members compared to each other
and how much they should pay for their vpn usage. It is possible to anonymize
nicknames of users.

Accepts env var `SHOULD_OUTPUT_ANONYMIZED_DATA` with either `true` as value, or
anything else will be treated as false.

To set the var permanently you can `cp template.env .env` and run `npm start` which
will automatically use `.env` file

Script requires file `allVpnProfiles.json` to be present. It was given me somewhen,
exported from some kind of WireGuard web admin panel. If you know what it was,
write me.

If you don't, you can run `cp template.allVpnProfiles.json allVpnProfiles.json`
and enter the data yourself.

Also script expects you to set `monthlyCostOfServer` constant.

## Outputs

### Simple metrics

```plaintext
Output anonymized data: true
amount of all vpn profiles:  64
amount of active vpn profiles:  58
amount of deleted vpn profiles:  6

mothly cost of server:  400
quarter cost of server:  1200

Current amount of users:  26
Quarterly payment of user where everybody equal:  46.15

Total transfer of all users (PB):  11.48
Total estimated transfer of all users in last quarter (PB):  2.28
```

### Tables

#### Users with their total, monthly and last quarter transfers (highest total first):

```plaintext
┌──────────┬────────────┬──────────────┬────────────────┐
│ (index)  │ Total (GB) │ Monthly (GB) │ Quarterly (GB) │
├──────────┼────────────┼──────────────┼────────────────┤
│ User6409 │ 2456.94    │ 172.95       │ 518.84         │
│ User5739 │ 1608.12    │ 84.23        │ 252.68         │
│ User8882 │ 1176.92    │ 60.17        │ 180.52         │
│ User486  │ 1035.41    │ 86.34        │ 259.02         │
│ User5338 │ 761.13     │ 38.47        │ 115.42         │
│ User3018 │ 494.62     │ 33.08        │ 99.23          │
│ User7668 │ 465.54     │ 30.01        │ 90.03          │
│ User6913 │ 451.04     │ 34.93        │ 104.79         │
│ User4400 │ 419.61     │ 21.21        │ 63.63          │
│ User1525 │ 404.44     │ 30.43        │ 91.3           │
│ User4471 │ 397.86     │ 20.76        │ 62.29          │
│ User9962 │ 386.75     │ 19.81        │ 59.43          │
│ User7891 │ 328.21     │ 19.32        │ 57.95          │
│ User370  │ 243.18     │ 26.25        │ 78.76          │
│ User4284 │ 202.63     │ 12.17        │ 36.52          │
│ User7466 │ 198.34     │ 22.32        │ 66.96          │
│ User5112 │ 145.79     │ 7.65         │ 22.94          │
│ User5243 │ 124.86     │ 16.99        │ 50.98          │
│ User7147 │ 106.76     │ 14.02        │ 42.05          │
│ User1499 │ 90.52      │ 6.94         │ 20.81          │
│ User4675 │ 90.33      │ 5.61         │ 16.82          │
│ User6691 │ 78.62      │ 4.08         │ 12.25          │
│ User8313 │ 32.53      │ 4.73         │ 14.18          │
│ User8710 │ 29.76      │ 1.56         │ 4.68           │
│ User3469 │ 22.92      │ 4.22         │ 12.67          │
│ User6452 │ 2.31       │ 0.12         │ 0.35           │
└──────────┴────────────┴──────────────┴────────────────┘
```

#### Users with their relative total server transfer (highest percent first) and according payment:

```plaintext
┌──────────┬────────────────────────────┬─────────────────────────────────────────────┐
│ (index)  │ % of total server transfer │ Quarterly payment from total transfer (RUB) │
├──────────┼────────────────────────────┼─────────────────────────────────────────────┤
│ User6409 │ 20.9                       │ 250.81                                      │
│ User5739 │ 13.68                      │ 164.16                                      │
│ User8882 │ 10.01                      │ 120.14                                      │
│ User486  │ 8.81                       │ 105.7                                       │
│ User5338 │ 6.47                       │ 77.7                                        │
│ User3018 │ 4.21                       │ 50.49                                       │
│ User7668 │ 3.96                       │ 47.52                                       │
│ User6913 │ 3.84                       │ 46.04                                       │
│ User4400 │ 3.57                       │ 42.84                                       │
│ User1525 │ 3.44                       │ 41.29                                       │
│ User4471 │ 3.38                       │ 40.61                                       │
│ User9962 │ 3.29                       │ 39.48                                       │
│ User7891 │ 2.79                       │ 33.51                                       │
│ User370  │ 2.07                       │ 24.82                                       │
│ User4284 │ 1.72                       │ 20.68                                       │
│ User7466 │ 1.69                       │ 20.25                                       │
│ User5112 │ 1.24                       │ 14.88                                       │
│ User5243 │ 1.06                       │ 12.75                                       │
│ User7147 │ 0.91                       │ 10.9                                        │
│ User1499 │ 0.77                       │ 9.24                                        │
│ User4675 │ 0.77                       │ 9.22                                        │
│ User6691 │ 0.67                       │ 8.03                                        │
│ User8313 │ 0.28                       │ 3.32                                        │
│ User8710 │ 0.25                       │ 3.04                                        │
│ User3469 │ 0.19                       │ 2.34                                        │
│ User6452 │ 0.02                       │ 0.24                                        │
└──────────┴────────────────────────────┴─────────────────────────────────────────────┘
```

#### Users in relation to estimated last quarter transfer (highest percent first):

```plaintext
┌──────────┬───────────────────────┬───────────────────────────────────────────┐
│ (index)  │ % of quarter transfer │ Quarterly payment from last quarter (RUB) │
├──────────┼───────────────────────┼───────────────────────────────────────────┤
│ User6409 │ 22.22                 │ 266.63                                    │
│ User486  │ 11.09                 │ 133.11                                    │
│ User5739 │ 10.82                 │ 129.85                                    │
│ User8882 │ 7.73                  │ 92.77                                     │
│ User5338 │ 4.94                  │ 59.31                                     │
│ User6913 │ 4.49                  │ 53.85                                     │
│ User3018 │ 4.25                  │ 50.99                                     │
│ User1525 │ 3.91                  │ 46.92                                     │
│ User7668 │ 3.86                  │ 46.27                                     │
│ User370  │ 3.37                  │ 40.48                                     │
│ User7466 │ 2.87                  │ 34.41                                     │
│ User4400 │ 2.72                  │ 32.7                                      │
│ User4471 │ 2.67                  │ 32.01                                     │
│ User9962 │ 2.55                  │ 30.54                                     │
│ User7891 │ 2.48                  │ 29.78                                     │
│ User5243 │ 2.18                  │ 26.2                                      │
│ User7147 │ 1.8                   │ 21.61                                     │
│ User4284 │ 1.56                  │ 18.77                                     │
│ User5112 │ 0.98                  │ 11.79                                     │
│ User1499 │ 0.89                  │ 10.69                                     │
│ User4675 │ 0.72                  │ 8.64                                      │
│ User8313 │ 0.61                  │ 7.29                                      │
│ User3469 │ 0.54                  │ 6.51                                      │
│ User6691 │ 0.52                  │ 6.3                                       │
│ User8710 │ 0.2                   │ 2.4                                       │
│ User6452 │ 0.01                  │ 0.18                                      │
└──────────┴───────────────────────┴───────────────────────────────────────────┘
```
