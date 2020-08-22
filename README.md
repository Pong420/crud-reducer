## CRUD Reducer

CRUD reducer for react/redux

## Usage

[CodeSandbox](https://codesandbox.io/s/crud-reducer-todo-11rzj?file=/src/App.tsx)

> redux

```ts
import { createCRUDReducer } from '../crudReducer';

const [initialState, reducer] = createCRUDReducer<Post, 'id'>('id');
```

> React hooks

```ts
import React, { useEffect } from 'react';
import { createCRUDReducer } from '../crudReducer';
import { createUseCRUDReducer } from '../useCRUDReducer';

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
