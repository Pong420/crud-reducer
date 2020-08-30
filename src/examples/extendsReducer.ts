import {
  createCRUDReducer,
  createCRUDActionsCreators,
  UnionActions
} from '../';

interface Todo {
  id: string;
  content: string;
}

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
