
## Overall Purpose of the System

This platform is a **full prop-trading operations backend** designed to:

* Manage trader challenges and funded accounts
* Enforce automated risk rules
* Detect abuse (copy trading, multi-accounting)
* Control payouts and withdrawals
* Support compliance, audits, and growth analytics

It combines **automation + human verification**, which is mandatory in real prop firms.


### Features

* Total Accounts (all lifecycle stages)
* Phase 1 / Phase 2 / Live account counts
* Total Users & Average Accounts per User
* Daily Drawdown Breach %
* Max Drawdown Breach %
* Average Pass Time & Breach Time
* Total Payouts, Average Payouts, Number of Payouts
* Pass/Fail trend graph (last 30 days)

### Functional Role

* Real-time business health monitoring
* Risk exposure visibility
* Growth, churn, and funnel analysis


## 2. Trade Account Management (Core Operations)

### Features

* Complete list of all trading accounts
* Fields:

  * Broker Login ID
  * User
  * Challenge & Phase
  * Broker Type (MetaTrader, MatchTrader, etc.)
  * Initial Balance
  * Profit Split
  * Account Status (Active / Blocked / Live)
  * Copy Trading Flag
  * Data Source (Webhook/API)

### Admin Actions

* Pass / Fail account verification
* Block or unblock accounts
* Upgrade account to Live
* Resync broker data
* View trades & positions

### Functional Role

* Single source of truth for trader lifecycle
* Manual override of automated decisions
* Compliance and dispute handling


## 3. Challenge Type Configuration (Product Catalog)

### Features

* Create and manage challenge products
* Fields:

  * Title
  * Number of steps (1-step / 2-step)
  * Challenge Type (GOAT / Classic / No Time Limit)
  * Product ID (payment gateway mapping)

### Functional Role

* Defines sellable challenge SKUs
* Links checkout → account provisioning → phases
* Directly affects revenue and conversion


## 4. Phase Configuration (Risk Rule Engine)

### Features

* Phase-level rule definitions:

  * Target Profit
  * Daily Drawdown %
  * Maximum Drawdown %
  * Trading Period / No-Time-Limit
  * Live vs Evaluation flag

### Functional Role

* Core automated risk enforcement
* Determines auto-pass, auto-fail, auto-block
* One of the most critical financial safety layers


## 5. Risk & Account Analysis

### Features

* Daily DD Breach statistics
* Max DD Breach statistics
* Average pass and breach timing
* Per-account behavioral metrics (inferred)

### Functional Role

* Challenge difficulty calibration
* Detection of risky trading behavior
* Continuous improvement of rule design


## 6. Copy Trading & Abuse Detection

### Features

* Copy Trading Events log
* Copy Trading Analysis (account-to-account comparison)
* Flags based on:

  * Same symbols
  * Same direction
  * Similar timing
  * Similar volume

### Functional Role

* Prevents account farming
* Protects firm capital
* Supports account bans and payout denial


## 7. IP Analysis & Multi-Account Detection

### Features

* Account IP Events
* IP → multiple account mapping
* Suspicious network usage tracking

### Functional Role

* Detects shared devices, VPN abuse
* Enforces “one trader per challenge” rules
* Strengthens KYC and compliance


## 8. Pending Tasks (Human Verification Queue)

### Features

* Phase pass verification needed
* Live account verification
* KYC verification required
* Pending withdrawal approvals

### Functional Role

* Mandatory manual control layer
* Prevents fraudulent funding and payouts
* Aligns with financial audit requirements

## 9. Withdrawals & Payout Management

### Features

* Withdrawal request list
* Approval / rejection flow
* Payout statistics dashboard
* Historical payout tracking

### Functional Role

* Cash-flow control
* Fraud prevention
* Trader trust and retention


## 10. Trade & Position Management

### Features

* Closed positions list
* Trade details:

  * Symbol
  * Direction
  * Volume
  * Profit/Loss
  * Open/Close time
  * Risk-Reward ratio
  * Holding duration

### Functional Role

* Trade audits
* Rule violation investigations
* Dispute resolution

## 11. Email Template System (Event-Driven Communication)

### Features

* Predefined transactional email templates:

  * Welcome
  * Pass / Fail
  * Withdrawal approved / rejected
  * Rule violation
  * Inactivity warning
* Editable subject and body

### Functional Role

* Automated communication on state changes
* Legal and compliance notifications
* Improves transparency with traders


## 12. User Management

### Features

* Admin user list
* Active / inactive users
* Login tracking

### Functional Role

* Access control
* Audit trail
* Security governance


## Final One-Line Summary

**This system is a complete, production-ready prop-trading back-office platform that manages trader challenges, enforces automated risk rules, detects fraud, controls payouts, and provides full operational, financial, and compliance oversight.**
