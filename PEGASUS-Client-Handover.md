# Pegasus General Store — AI Concierge Technical Handover

**Prepared for:** Pegasus General Store  
**Purpose:** Production configuration, deployment, verification and ongoing maintenance of the Ask Pegasus AI Customer Concierge.

---

## 1. Overview

Ask Pegasus is an AI-powered Customer Concierge integrated into the Pegasus General Store website.

The chatbot supports:

- Store information and opening hours
- Product Finder
- Gift Builder
- Meal Builder
- Local Supplier Stories
- Click & Collect assistance
- Customer Product Request assistance
- Follow-up conversations
- Human assistance and escalation

### Technology Stack

| Technology | Purpose |
|---|---|
| React | Chatbot user interface |
| Anthropic Claude | AI response generation |
| Supabase | Product, supplier and store information |
| Cloudflare Pages | Website hosting |
| Cloudflare Pages Functions | Production chatbot backend |
| GitHub | Source code and version control |

---

## 2. Current Status

- Anthropic Claude integration is implemented.
- The production backend runs through Cloudflare Pages Functions.
- Supabase integration is implemented.
- The `main` branch contains the latest deployed production code.
- Local functional testing using OpenAI has been completed across all eight chatbot feature categories, with minor response-quality refinements identified.
- Client API key configuration and final live testing using Anthropic Claude are pending.
- Best-effort, instance-level rate limiting of 10 requests per minute per IP address has been implemented on the feature branch and successfully tested locally. Production deployment and verification remain pending.

---

## 3. Prerequisites

### Required Access

- Access to the Pegasus General Store GitHub repository.
- Access to the Cloudflare project.
- Access to the Supabase project.
- Anthropic account with API billing configured.

### Required Tools for Code Maintenance

| Tool | Verification Command | Installation |
|---|---|---|
| Node.js (supported LTS version compatible with the project) | `node -v` | https://nodejs.org |
| npm | `npm -v` | Included with Node.js |
| Git | `git --version` | https://git-scm.com |

These tools are required for retrieving and maintaining the codebase. A separate local backend server is not required for production operation.

---

## 4. Retrieve the Latest Code

The `main` branch contains the production code and is used for deployment through Cloudflare.

### First-Time Setup

If the repository has not been cloned previously, open a terminal and run:

```bash
git clone https://github.com/kchap225/PEGASUS-General-Store.git
cd PEGASUS-General-Store
git checkout main
git pull origin main
npm install
```

### Existing Repository

If the repository has already been cloned, there is no need to clone it again.

Open a terminal in the existing project directory and run:

```bash
git status
git checkout main
git pull origin main
npm install
```

Before switching branches or pulling changes, ensure any existing local modifications are safely committed or stashed as appropriate.

The `npm install` command installs the project dependencies defined in `package.json`.

---

## 5. API Key Configuration

### Generate an Anthropic API Key

1. Visit https://console.anthropic.com.
2. Sign in and configure API billing.
3. Navigate to API Keys.
4. Create a new API key named `pegasus-concierge`.
5. Copy and securely retain the generated key.

### Configure Cloudflare

1. Sign in to the Cloudflare dashboard.
2. Navigate to Workers & Pages.
3. Select the Pegasus General Store Pages project.
4. Open Settings → Variables and Secrets.
5. Select the production environment.
6. Add or verify the following environment variables.

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Client's Anthropic API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public API key |

Store the Anthropic API key securely as a secret. Never expose it in frontend code, share it publicly or commit it to GitHub.

The Claude integration is already implemented using the `claude-haiku-4-5` model. No manual OpenAI-to-Anthropic code migration is required.

---

## 6. Production Deployment

The production chatbot backend is located in:

`functions/api/chat.js`

The frontend communicates with the backend through the `/api/chat` endpoint.

After configuring the required environment variables:

1. Ensure all approved code changes are merged into `main`.
2. Redeploy the application through Cloudflare.
3. Confirm that the deployment completes successfully.
4. Open the live website and verify the chatbot.

**Live website:** https://pegasusgeneralstore.co.nz

No separate local backend server is required for production.

---

## 7. Chatbot Verification

After deployment, open the Ask Pegasus chat widget on the live website and verify that:

- Store information, product details and prices match Supabase records.
- Product, gift and meal recommendations are relevant and respect customer budgets.
- Local supplier information is accurate.
- Click & Collect assistance provides the correct website link.
- Customer product requests are handled without making unverified availability promises.
- Follow-up conversations retain relevant context.
- Unavailable information is handled appropriately, with human assistance recommended when necessary.
- Confidential information is protected and unauthorized actions are not performed.

If response accuracy or recommendation quality requires improvement, refine the chatbot instructions in `functions/api/chat.js` and retest.

Final production verification should be completed using the client's Anthropic API key.

---

## 8. Production File Structure

| File | Purpose |
|---|---|
| `src/components/ai/ChatWidget.jsx` | Chatbot interface and conversation handling |
| `functions/api/chat.js` | Production backend, Claude integration, Supabase data retrieval, chatbot instructions and request rate limiting |
| `src/App.jsx` | Integrates the chatbot into the website |
| `package.json` | Project dependencies |
| `vite.config.js` | Frontend build configuration |

The primary files for chatbot maintenance are `ChatWidget.jsx` and `functions/api/chat.js`.

---

## 9. Chatbot Maintenance

### Updating Chatbot Instructions

The production chatbot instructions are maintained in the `CONCIERGE_INSTRUCTIONS` section of `functions/api/chat.js`.

To update chatbot behaviour:

1. Open `functions/api/chat.js`.
2. Locate `CONCIERGE_INSTRUCTIONS`.
3. Modify the relevant instructions.
4. Commit and merge the approved changes into `main`.
5. Redeploy through Cloudflare and test the updated responses.

If further improvements in chatbot accuracy, response quality or recommendation relevance are required, the instructions in `chat.js` can be refined based on customer feedback and testing results.

### Updating Store Information

The chatbot retrieves information from the following Supabase tables:

| Table | Information |
|---|---|
| `products` | Product names, descriptions, categories, prices and preorder eligibility |
| `suppliers` | Supplier names, regions, stories and product ranges |
| `store_settings` | Store address, contact details and opening hours |

Store information can be updated directly in Supabase without modifying the chatbot instructions. Maintaining accurate and up-to-date database records helps improve chatbot response accuracy.

The current backend retrieves up to 50 product records and 50 supplier records per request. If the catalogue expands beyond these limits, the data retrieval logic in `chat.js` may need to be updated.

### Current Backend Configuration

| Configuration | Current Setting |
|---|---|
| AI model | `claude-haiku-4-5` |
| Maximum output tokens per response | 300 |
| Maximum user message length | 2,000 characters |
| Conversation history | Up to 10 previous valid messages |
| Product retrieval limit | 50 records |
| Supplier retrieval limit | 50 records |
| Request rate limit | 10 requests per minute per IP address (best-effort, instance-level; deployment pending) |
| Rate-limit response | HTTP 429 with Retry-After header |

These settings can be reviewed and adjusted in `functions/api/chat.js` if future operational requirements change.

### Monitoring API Usage

Monitor API usage, billing and available spending controls through the Anthropic Console to manage ongoing operational costs.

If additional usage control is required, an Admin ON/OFF toggle or a daily request limit can be implemented in the future to manage chatbot availability and API consumption. These controls should be enforced at the backend level.

---

## 10. Troubleshooting

| Issue | Recommended Action |
|---|---|
| AI assistant temporarily unavailable | Check Cloudflare logs, required environment variables, Anthropic API key and billing status. |
| Chatbot connection error | Verify the Cloudflare deployment and `/api/chat` endpoint. |
| Product, supplier or store information unavailable | Check Supabase environment variables, database records and permissions. |
| Incorrect chatbot responses | Review Supabase data and chatbot instructions in `chat.js`. |
| Recent changes not reflected | Verify that changes are merged into `main` and deployed through Cloudflare. |
| `npm install` fails | Verify the Node.js and npm versions and review dependency installation errors. |
| Excessive API usage | Review Anthropic usage reports and verify production rate-limiting configuration. |

---

## 11. Production Rate Limiting

A best-effort rate limiter has been implemented directly in `functions/api/chat.js` to help prevent excessive API usage and manage operational costs.

### Current Implementation

- Maximum 10 requests per minute per IP address per instance.
- Requests exceeding the limit return HTTP 429 with a Retry-After header.
- Request counters expire after 60 seconds.
- Expired counters are cleaned up during subsequent requests.
- The number of tracked IP addresses is limited to prevent excessive memory usage.
- Rate limiting is checked before Supabase queries and Claude API calls.
- No additional dependencies, database changes or Cloudflare configuration changes are required.

### Local Testing Results

| Test | Result |
|---|---|
| JavaScript syntax validation | Passed |
| Requests within the configured limit | Passed |
| 11th request blocked with HTTP 429 | Passed |
| 12th request blocked with HTTP 429 | Passed |
| Request acceptance after the 60-second window | Passed |

Rate-limiting tests were performed locally using Cloudflare Wrangler without consuming AI API credits.

Existing chatbot instructions, Claude integration, Supabase queries and conversation history logic remain unchanged.

### Limitations and Future Improvements

The current implementation uses in-memory request tracking. Since Cloudflare Pages Functions operate across distributed instances, the rate limit is best-effort and does not guarantee consistent enforcement across all production instances.

Customers sharing the same IP address may share the request limit. Requests without a Cloudflare IP header share a fallback counter.

For stronger production-wide protection, Cloudflare-level rate limiting or a shared-storage rate limiter may be implemented in the future.

The rate limiter helps reduce excessive API usage but does not guarantee a fixed API spending limit.

Production deployment, final rate-limiting verification and live chatbot regression testing using Anthropic Claude remain pending.
