import {
  Key,
  CrudActionMap,
  CrudActions,
  FilterFlags,
  AllowedNames
} from './curdAction';

export interface CrudState<I, Prefill extends boolean = true> {
  ids: string[];
  byIds: Record<string, I>;
  list: Prefill extends true ? (I | Partial<I>)[] : I[];
  pageNo: number;
  pageSize: number;
  total: number;
  params: Record<string, any>;
}

type T1 = Exclude<keyof CrudActions<any, any>, 'get' | 'map'>;
type T2 = ReturnType<CrudActions<any, any>[T1]>;

// export type CrudReducer<I, K extends Key<I>, Prefill extends boolean = true> = (
//   state: CrudState<I, Prefill>,
//   action: ReturnType<CrudActions<I, K>[keyof CrudActions<I, K>]>
// ) => CrudState<I, Prefill>;

// interface CreateCrudReducerOptions<I, K extends Key<I>> {
//   actions: CrudActions<I, K>;
// }

// interface TodoState {
//   id: string;
// }

// //   return state;
// // };

// export function createCrudReducer<I, K extends Key<I>>() {
//   const reducer: CrudReducer<TodoState, 'id'> = (state, action) => {
//     // type T1 = typeof action
//     if (action.type === 'Create') {
//       // console.log(action.payload);
//     }
//   };
// }
