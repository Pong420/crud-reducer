## CRUD Reducer

CRUD reducer for react/redux

## Usage

```
git clone https://github.com/Pong420/crud-reducer.git --branch=dist crud-reducer
rm -rf ./crud-reducer/.git
```

## Examples

- [TODO List - CodeSandbox](https://codesandbox.io/s/crud-reducer-todo-11rzj?file=/src/App.tsx)

* React hooks - [Details](./src/examples/hooks.tsx)

```ts
import React, { useEffect } from 'react';
import { createUseCRUDReducer } from '../';

interface Post {
  id: string;
  content: string;
}

const usePostReducer = createUseCRUDReducer<Post, 'id'>('id');

const getPosts = () =>
  Promise.resolve<Post[]>([{ id: '1', content: 'some content' }]);

export function Component() {
  const [state, actions] = usePostReducer();

  useEffect(() => {
    getPosts().then(posts => actions.list(posts));
  }, [actions]);

  return (
    <div>
      {state.list.map(post => (
        <div>{post.content}</div>
      ))}
    </div>
  );
}
```

- Redux - [Details](./src/examples/redux.ts)

```ts
import { createCRUDReducer, createCRUDActionsCreators, CRUDActions, useActions } from '../';

export type TodoActions = CRUDActions<Todo, 'id'>;

export const todoActions = createCRUDActionsCreators<Todo, 'id'>();

export const useTodoActions = () => useActions(todoActions);

export const [, todoReducer] = createCRUDReducer<Todo, 'id'>('id');

// usage
export function Component() {
  const actions = useTodoActions();

  const dispatch = useDispatch();

  return React.createElement<HTMLAttributes<HTMLButtonElement>>(
    'button',
    {
      onClick: () => {
        const payload = {
          id: String(Math.random()),
          content: String(Math.random())
        };

        actions.create(payload);
        // or
        dispatch(todoActions.create(payload));
      }
    },
    'Add todo'
  );
}
```

- Extend CRUD Reducer - [Details](./src/examples/extendsReducer.ts)

```ts
import { createCRUDReducer, createCRUDActionsCreators, UnionActions } from '../';

const [initialState, reducer] = createCRUDReducer<Todo, 'id'>('id');

const actions = {
  ...createCRUDActionsCreators<Todo, 'id'>(),
  extraAction: (payload: boolean) => ({
    type: 'ExtraAction' as const, // or enum
    payload
  })
};

type Actions = UnionActions<typeof actions>;

export function todoReducer(state = initialState, action: Actions) {
  switch (action.type) {
    case 'ExtraAction':
      return state;
    default:
      return reducer(state, action);
  }
}
```

- Pagination - WIP

## Utils / Types

- `UnionActions` and `ExtractAction`

```typescript
import { UnionActions, ExtractAction } from '../';

function actions4() {
  return { type: 'Action4' as const };
}

// An object contains function that return { type: string, payload? any }
// your may use enum instead of `as const`
const actions = {
  action1: () => ({ type: 'Action1' as const }),
  action2: (payload: boolean) => ({ type: 'Action2' as const, payload }),
  action3: (payload?: boolean) => ({ type: 'Action3' as const, payload }),
  actions4
};

type Actions = UnionActions<typeof actions>;

type Aaction3 = ExtractAction<Actions, 'Action3'>;
```
