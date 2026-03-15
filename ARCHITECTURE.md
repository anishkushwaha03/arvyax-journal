# ArvyaX Journal Architecture & Scaling Strategy

This document outlines the architectural decisions and scaling strategies for the ArvyaX AI-Assisted Journal System.

### 1. How would you scale this to 100k users?
To handle 100,000 users, the system must be scaled both at the application and database layers:
* **Horizontal Scaling:** Deploy multiple instances of the Node.js/Express backend using a container orchestration tool like Kubernetes or Docker Swarm, placed behind a Load Balancer (e.g., NGINX or AWS ALB) to distribute incoming traffic evenly.
* **Database Optimization:** Ensure MongoDB is properly indexed. Specifically, an index on the `userId` and `createdAt` fields in the `journals` collection is crucial since the Insights API frequently aggregates data based on these fields. For heavier loads, we would implement MongoDB Sharding to distribute data across multiple clusters.
* **Insights Caching:** The Insights API performs heavy MongoDB aggregations. Instead of calculating this on every page load, we would compute these insights periodically (e.g., via a background cron job) or cache the result in Redis for a few minutes.

### 2. How would you reduce LLM cost?
LLM API calls can quickly become a bottleneck for both cost and rate limits.
* **Model Selection:** Use the most cost-effective model that still gets the job done. For simple emotion detection and keyword extraction, smaller models (like Gemini 2.5 Flash or GPT-4o-mini) are significantly cheaper and faster than their larger reasoning counterparts.
* **Input Truncation:** Limit the character count of journal entries sent to the LLM. If a user writes a 5,000-word essay, we only need to send the first and last few hundred words to accurately gauge the primary emotion and extract keywords.
* **Batching:** If real-time analysis is not strictly necessary, queue entries and send them to the LLM in a single batch prompt to reduce per-request overhead.

### 3. How would you cache repeated analysis?
Users often write similar journal entries (e.g., "I felt peaceful today"). We can avoid sending identical text to the LLM multiple times.
* **Implementation:** Use a fast, in-memory data store like Redis.
* **Hashing:** When a user submits an entry, generate a cryptographic hash (like SHA-256) of the sanitized input string.
* **Lookup:** Use this hash as a key in Redis. Before calling the LLM, check if the key exists. If it does, immediately return the cached `emotion`, `keywords`, and `summary`. If not, call the LLM, store the result in Redis under that hash, and then return it to the client.

### 4. How would you protect sensitive journal data?
Journal entries are highly personal and require strict security measures.
* **Data in Transit and at Rest:** Enforce TLS/HTTPS for all API communications. Enable encryption at rest on the MongoDB database so that physical access to the storage volumes does not expose user data.
* **LLM Data Anonymization:** Never send PII (Personally Identifiable Information) to third-party LLM providers. Ensure `userId`s, names, or locations are stripped or masked before the text is sent to the Gemini API.
* **Access Control:** Implement robust authentication and authorization (e.g., JWTs) to ensure users can only ever access their own `userId` records via the API endpoints.