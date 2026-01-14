# PR: Add sends and receives support to domains

## What This PR Does

This PR adds SDK support for domain-level `sends` and `receives` properties, mirroring the existing service implementation. This allows developers to programmatically add events, commands, and queries to domains, enabling domains to directly document their published language of events without requiring services as intermediaries.

## Changes Overview

### Key Changes

- Add `sends` and `receives` properties to the `Domain` interface in `types.d.ts`
- Add deduplication for `sends` and `receives` arrays in `writeDomain()`
- Add `addMessageToDomain()` function with full JSDoc documentation
- Export three new functions: `addEventToDomain`, `addCommandToDomain`, `addQueryToDomain`
- Add comprehensive test coverage (20 new tests)

## How It Works

1. **Type Updates**: The `Domain` interface now includes optional `sends` and `receives` arrays using the existing `SendsPointer` and `ReceivesPointer` types

2. **Write Function**: `writeDomain()` now deduplicates sends/receives arrays using `uniqueVersions()` before writing

3. **Add Message Function**: `addMessageToDomain(direction, message, version?)` adds events/commands/queries to either `sends` or `receives`:

   - Validates direction ('sends' or 'receives')
   - Prevents duplicates (same id + version)
   - Preserves file format (.md/.mdx)
   - Works with versioned domains

4. **Exported Aliases**: Three convenience functions (`addEventToDomain`, `addCommandToDomain`, `addQueryToDomain`) all call `addMessageToDomain`

## Breaking Changes

None

## Additional Notes

- Follows the same patterns established by `addMessageToService()` for consistency
- All 439 SDK tests pass
- This complements the EventCatalog core PR that adds sends/receives support to the domain schema and sidebar

🤖 Generated with [Claude Code](https://claude.ai/code)
