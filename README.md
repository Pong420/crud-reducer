## CRUD Reducer

CRUD reducer for react/redux

### Install

```
git clone https://github.com/Pong420/crud-reducer.git --branch=dist crud-reducer
rm -rf ./crud-reducer/.git
```

### Examples

- [React hooks](./src/examples/hooks.tsx)
- [React Redux](./src/examples/redux.ts)
- [Extend CRUD Reducer](./src/examples/extendsReducer.ts)

- Pagination - WIP

### Utils / Types

- `GetCreatorsAction` and `ExtractAction`

```typescript
import { GetCreatorsAction, ExtractAction } from '../';

function actions4() {
  return { type: 'Action4' as const };
}

// An object contains function that return { type: string, payload? any }
// you may use enum instead of `as const`
const actions = {
  action1: () => ({ type: 'Action1' as const }),
  action2: (payload: boolean) => ({ type: 'Action2' as const, payload }),
  action3: (payload?: boolean) => ({ type: 'Action3' as const, payload }),
  actions4
};

type Actions = GetCreatorsAction<typeof actions>;

type Aaction3 = ExtractAction<Actions, 'Action3'>;
```
