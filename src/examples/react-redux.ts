import React, { HTMLAttributes } from 'react';
import { useDispatch } from 'react-redux';
import {
  getCRUDActionsCreator,
  createCRUDReducer,
  useActions,
  GetCreatorsAction
} from '..';

interface Todo {
  id: string;
  content: string;
}

export const [
  //
  todoActions,
  todoActionsTypes
] = getCRUDActionsCreator<Todo, 'id'>()({
  // customize the actions you need
  LIST: 'LIST_TODO',
  CREATE: 'CREATE_TODO',
  UPDATE: 'UPDATE_TODO',
  DELETE: 'DELETE_TODO'
  // remember to add const
} as const);

export type TodoActions = GetCreatorsAction<typeof todoActions>;

export const useTodoActions = () => useActions(todoActions);

export const [initialState, todoReducer] = createCRUDReducer<Todo, 'id'>('id', {
  // required for custom action types
  actionTypes: todoActionsTypes
});

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
