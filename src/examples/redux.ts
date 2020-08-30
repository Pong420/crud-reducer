import React, { HTMLAttributes } from 'react';
import { useDispatch } from 'react-redux';
import {
  createCRUDReducer,
  createCRUDActionsCreators,
  CRUDActions,
  useActions
} from '../';

interface Todo {
  id: string;
  content: string;
}

export type TodoActions = CRUDActions<Todo, 'id'>;

export const todoActions = createCRUDActionsCreators<Todo, 'id'>();

export const useTodoActions = () => useActions(todoActions);

export const [, todoReducer] = createCRUDReducer<Todo, 'id'>('id');

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
