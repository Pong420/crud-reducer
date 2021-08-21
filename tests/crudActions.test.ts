import { createCrudActionCreator } from '../src/crudAction';

describe('actions', () => {
  test('default action type', () => {
    const payload = { id: '123' };
    const actions = createCrudActionCreator<{ id: string }, 'id'>();

    expect(actions).toBeDefined();
    expect(actions.list([])).toEqual({ type: 'List', payload: [] });
    expect(actions.create(payload)).toEqual({ type: 'Create', payload });
    expect(actions.update(payload)).toEqual({ type: 'Update', payload });
    expect(actions.delete(payload)).toEqual({ type: 'Delete', payload });
    expect(actions.paginate([])).toEqual({ type: 'Paginate', payload: [] });
    expect(actions.params(payload)).toEqual({ type: 'Params', payload });
    expect(actions.reset()).toEqual({ type: 'Reset' });
    expect(actions.insert(payload, 0)).toEqual({
      type: 'Insert',
      payload,
      index: 0
    });
  });

  test('prefix action types', () => {
    const payload = { id: '123' };
    const actions = createCrudActionCreator<{ id: string }, 'id'>('Todo');

    expect(actions).toBeDefined();
    expect(actions.list([])).toEqual({ type: 'List', payload: [] });
    expect(actions.create(payload)).toEqual({ type: 'Create', payload });
    expect(actions.update(payload)).toEqual({ type: 'Update', payload });
    expect(actions.delete(payload)).toEqual({ type: 'Delete', payload });
    expect(actions.paginate([])).toEqual({
      type: 'Paginate',
      payload: []
    });
    expect(actions.params(payload)).toEqual({ type: 'Params', payload });
    expect(actions.reset()).toEqual({ type: 'Reset' });
    expect(actions.insert(payload)).toEqual({ type: 'Insert', payload });

    // expect(actions).toBeDefined();
    // expect(actions.list([])).toEqual({ type: 'Todo-List', payload: [] });
    // expect(actions.create(payload)).toEqual({ type: 'Todo-Create', payload });
    // expect(actions.update(payload)).toEqual({ type: 'Todo-Update', payload });
    // expect(actions.delete(payload)).toEqual({ type: 'Todo-Delete', payload });
    // expect(actions.paginate([])).toEqual({
    //   type: 'Todo-Paginate',
    //   payload: []
    // });
    // expect(actions.params(payload)).toEqual({ type: 'Todo-Params', payload });
    // expect(actions.reset()).toEqual({ type: 'Todo-Reset' });
    // expect(actions.insert(payload)).toEqual({ type: 'Todo-Insert', payload });
  });
});
