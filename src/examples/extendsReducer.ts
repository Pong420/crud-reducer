import { createCRUDReducer, getCRUDActionsCreator, UnionActions } from '../';

interface Todo {
  id: string;
  content: string;
}

const [initialState, reducer] = createCRUDReducer<Todo, 'id'>('id');
const [
  defaultActions
  // defaultActionTypes
] = getCRUDActionsCreator<Todo, 'id'>()();

const actions = {
  ...defaultActions,
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
