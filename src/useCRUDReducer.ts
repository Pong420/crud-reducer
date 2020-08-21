/* eslint-disable @typescript-eslint/ban-types */

import { useReducer, useRef } from 'react';
import { createCRUDReducer, CreateCRUDReducerOptions } from './crudReducer';
import { AllowedNames, createCRUDActionsCreators } from './crudActions';
import { bindDispatch } from './bindDispatch';

export function createUseCRUDReducer<
  I extends {},
  K extends AllowedNames<I, string>
>(key: K, options?: CreateCRUDReducerOptions) {
  const [intialState, reducer] = createCRUDReducer<I, K>(key, options);
  return function useCRUDReducer() {
    const [state, dispatch] = useReducer(reducer, intialState);
    const { current: actions } = useRef({
      dispatch,
      ...bindDispatch(createCRUDActionsCreators<I, K>(), dispatch)
    });
    return [state, actions] as const;
  };
}
