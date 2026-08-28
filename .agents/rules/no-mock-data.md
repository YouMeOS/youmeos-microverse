# Strict Prohibition of Mock & Synthetic Data

## Core Directives

1. **Zero Mock or Synthetic Data Generation**:
   - Never generate fake names, mock contact information, fabricated license numbers, random phone numbers (e.g. 555-xxx), or synthetic emails (e.g. `*@gmail.com`).
   - Do not create helper generators, fallback algorithms, or local seed arrays that invent realistic-looking people or businesses.

2. **Live Data or Clean Empty State**:
   - All displayed records, contacts, and enrichments must originate from live, verified external APIs, authenticated databases, or actual user input.
   - When a live data source returns no records or fails to connect, return an explicit empty state (`[]`, `null`) with a clear user notice (e.g. "No verified records found"). Never fall back to fabricated data.

3. **No Hardcoded Personal Identifiers**:
   - Fallback and default values must use generic labels (e.g. "Unknown", "Unassigned", or empty strings `""`).
