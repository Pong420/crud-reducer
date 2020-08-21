import React, { useEffect } from 'react';
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
