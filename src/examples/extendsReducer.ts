import {
  createCRUDReducer,
  getCRUDActionsCreator,
  UnionActions,
  ExtractAction
} from '../';

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

export type TodoActions = UnionActions<typeof actions>;
export type ExtraAction = ExtractAction<TodoActions, 'ExtraAction'>;

export function todoReducer(state = initialState, action: TodoActions) {
  switch (action.type) {
    case 'ExtraAction':
      return state;
    default:
      return reducer(state, action);
  }
}
