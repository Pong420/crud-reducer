/* eslint-disable @typescript-eslint/ban-types */

import { useReducer, useState } from 'react';
import { Key, CrudActionCreators, createCrudActionCreator } from './crudAction';
import {
  CrudState,
  CrudReducer,
  CreateCrudReducerOptions,
  createCrudReducer
} from './crudReducer';
import { bindDispatch, Dispatched } from './bindDispatch';

export type UseCrudReducer<
  I,
  K extends Key<I>,
  Prefill extends boolean = true
> = () => [CrudState<I, Prefill>, Dispatched<CrudActionCreators<I, K>>];

export interface CreateUseCrudReducerOps<
  I,
  K extends Key<I>,
  Prefill extends boolean = true
> extends CreateCrudReducerOptions<I, K, Prefill> {
  initializer?: (
    initialState: CrudState<I, Prefill>,
    reducer: CrudReducer<I, K, Prefill>
  ) => CrudState<I, Prefill>;
}

// prettier-ignore
export interface CreateUseCrudReducer  {
  <I, K extends Key<I>>(key: K, options: CreateUseCrudReducerOps<I, K, false> & { prefill: false }): UseCrudReducer<I, K, false>;
  <I, K extends Key<I>>(key: K, options: CreateUseCrudReducerOps<I, K, true>): UseCrudReducer<I, K, true>;
  <I, K extends Key<I>>(key: K, options?: CreateUseCrudReducerOps<I, K, boolean>): UseCrudReducer<I, K, boolean>
}

export const createUseCrudReducer: CreateUseCrudReducer = <I, K extends Key<I>>(
  key: K,
  { initializer, ...options }: CreateUseCrudReducerOps<I, K, boolean> = {}
) => {
  const creators = options.actionCreators || createCrudActionCreator();
  const [initialState, reducer] = createCrudReducer<I, K>(key, options);

  return function useCrudReducer() {
    const [state, dispatch] = useReducer(reducer, initialState, state =>
      initializer ? initializer(state, reducer) : state
    );
    const [actions] = useState(() => {
      return { dispatch, ...bindDispatch(creators, dispatch) };
    });
    return [state, actions];
  };
};
