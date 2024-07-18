## @eventcatalog/sdk

_Warning: Still currently in beta, and APIs may change. Looking for stable release in July 2024._

### Installation

```sh
npm i @eventcatalog/sdk
```

### Usage

```typescript
import utils from '@eventcatalog/sdk';

const { getEvent } = utils(PATH_TO_CATALOG);

// Gets event by id
await getEvent('InventoryEvent');

// Gets event by id and version
await getEvent('InventoryEvent', '1.0.0');
```

